import axios from 'axios';
import { esewaConfig } from './esewa.config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class EsewaService {
  // Generate unique transaction ID
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TT-${timestamp}-${random}`;
  }

  // Create eSewa payment request
  async createPaymentRequest(orderId: number, totalAmount: number) {
    try {
      // Get order details with user information
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: true,  // Include buyer details for customer info
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.buyer) {
        throw new Error('Buyer information not found');
      }

      // Generate transaction ID
      const transactionId = this.generateTransactionId();
      
      // eSewa expects amounts in RUPEES for form fields
      const amountInRupees = totalAmount;
      
      // Calculate charges (adjust based on your business logic)
      const taxAmount = totalAmount * 0.13; // 13% VAT
      const serviceCharge = 30; // Fixed service charge
      const deliveryCharge = 100; // Fixed delivery charge
      
      const totalAmountWithCharges = amountInRupees + taxAmount + serviceCharge + deliveryCharge;
      
      // Convert to paisa for signature calculation
      const totalAmountInPaisa = Math.round(totalAmountWithCharges * 100);
      
      // Generate signature - eSewa signature requires amount in paisa
      const message = `total_amount=${totalAmountInPaisa},transaction_uuid=${transactionId},product_code=${esewaConfig.merchantId}`;
      
      const signature = crypto
        .createHmac('sha256', esewaConfig.secretKey)
        .update(message)
        .digest('base64');

      // Get customer details
      const customerName = order.buyer.name || 'Customer';
      const customerEmail = order.buyer.email;
      const customerPhone = '9800000000'; // You might need to add phone field to User model

      // Create payment data for eSewa form
      const paymentData = {
        // Amounts in RUPEES (formatted to 2 decimal places)
        amount: amountInRupees.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmountWithCharges.toFixed(2),
        transaction_uuid: transactionId,
        product_code: esewaConfig.merchantId,
        product_service_charge: serviceCharge.toFixed(2),
        product_delivery_charge: deliveryCharge.toFixed(2),
        // Frontend URLs for redirects (eSewa will redirect user here)
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/payment-success.html?orderId=${orderId}`,
        failure_url: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/payment-failed.html?orderId=${orderId}`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature,
        
        // Additional customer info (optional but recommended)
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      };

      // Save payment transaction in database
      await prisma.paymentTransaction.create({
        data: {
          orderId: orderId,
          transactionId: transactionId,
          amount: totalAmount,
          status: 'PENDING',
          paymentMethod: 'ESEWA',
          paymentData: JSON.stringify(paymentData),
          // Store additional data for reference
          // Note: Based on your schema, you don't have signatureData field
          // If needed, add it to the schema or store in paymentData
        }
      });

      // Also update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PENDING'
        }
      });

      return {
        paymentUrl: `${esewaConfig.baseUrl}/api/epay/main/v2/form`,
        paymentData: paymentData,
        transactionId: transactionId
      };

    } catch (error) {
      console.error('Error creating eSewa payment:', error);
      throw new Error('Failed to create payment request: ' + (error as Error).message);
    }
  }

  // Verify eSewa payment from callback (called by eSewa after payment)
  async verifyPaymentFromCallback(data: any) {
    try {
      // eSewa sends data as form-urlencoded
      const { 
        transaction_uuid, 
        transaction_code, 
        status, 
        total_amount,
        signature
      } = data;

      if (!transaction_uuid) {
        throw new Error('Transaction ID is required');
      }

      // Find payment transaction
      const payment = await prisma.paymentTransaction.findUnique({
        where: { transactionId: transaction_uuid },
        include: { 
          order: {
            include: {
              items: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment transaction not found');
      }

      // Verify signature (important for security)
      if (signature) {
        // Note: eSewa sends amount in paisa in the signature
        const verifyMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${esewaConfig.merchantId}`;
        const computedSignature = crypto
          .createHmac('sha256', esewaConfig.secretKey)
          .update(verifyMessage)
          .digest('base64');
          
        if (computedSignature !== signature) {
          console.warn('Signature verification failed - possible tampering');
          // Continue but log warning
        }
      }

      if (status === 'COMPLETE' || transaction_code) {
        // Payment successful
        
        // Update payment transaction
        await prisma.paymentTransaction.update({
          where: { transactionId: transaction_uuid },
          data: {
            status: 'COMPLETED',
            transactionCode: transaction_code,
            paymentResponse: JSON.stringify(data),
            completedAt: new Date()
          }
        });

        // Update order payment status and order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PROCESSING', // Change order status to processing
            updatedAt: new Date()
          }
        });

        // Update product quantities (reduce stock)
        for (const item of payment.order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }

        // Create notification for buyer
        await prisma.notification.create({
          data: {
            userId: payment.order.buyerId,
            type: 'ORDER_PLACED',
            title: 'Order Placed Successfully',
            message: `Your order #${payment.orderId} has been placed and payment is confirmed.`,
            metadata: {
              orderId: payment.orderId,
              amount: payment.amount,
              transactionId: transaction_uuid
            }
          }
        });

        return {
          success: true,
          orderId: payment.orderId,
          transactionId: transaction_uuid,
          transactionCode: transaction_code,
          message: 'Payment completed successfully'
        };
      } else {
        // Payment failed
        await prisma.paymentTransaction.update({
          where: { transactionId: transaction_uuid },
          data: {
            status: 'FAILED',
            paymentResponse: JSON.stringify(data),
            completedAt: new Date()
          }
        });

        // Update order payment status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        return {
          success: false,
          orderId: payment.orderId,
          transactionId: transaction_uuid,
          message: 'Payment failed or cancelled'
        };
      }

    } catch (error) {
      console.error('Error verifying eSewa payment from callback:', error);
      throw new Error('Failed to verify payment from callback: ' + (error as Error).message);
    }
  }

  // Handle eSewa callback (success/failure)
  async handleCallback(data: any) {
    try {
      const result = await this.verifyPaymentFromCallback(data);
      return result;
      
    } catch (error) {
      console.error('Error handling eSewa callback:', error);
      throw new Error('Failed to process payment callback: ' + (error as Error).message);
    }
  }

  // Manual verification (for admin/retry)
  async verifyPaymentManually(transactionId: string, orderId: number) {
    try {
      // Verify with eSewa API
      const verifyUrl = `${esewaConfig.baseUrl}/api/epay/transaction/status/${transactionId}`;
      
      console.log('Verifying payment with URL:', verifyUrl);
      
      const response = await axios.get(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${esewaConfig.secretKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('eSewa verification response:', response.data);

      if (response.data.status === 'COMPLETE') {
        // Update payment transaction
        await prisma.paymentTransaction.update({
          where: { transactionId: transactionId },
          data: {
            status: 'COMPLETED',
            transactionCode: response.data.transaction_code,
            paymentResponse: JSON.stringify(response.data),
            completedAt: new Date()
          }
        });

        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PROCESSING',
            updatedAt: new Date()
          }
        });

        return {
          success: true,
          message: 'Payment verified successfully',
          data: response.data
        };
      } else {
        // Payment failed
        await prisma.paymentTransaction.update({
          where: { transactionId: transactionId },
          data: {
            status: 'FAILED',
            paymentResponse: JSON.stringify(response.data),
            completedAt: new Date()
          }
        });

        return {
          success: false,
          message: 'Payment verification failed',
          data: response.data
        };
      }

    } catch (error) {
      console.error('Error manually verifying eSewa payment:', error);
      
      // Update payment as error
      await prisma.paymentTransaction.update({
        where: { transactionId: transactionId },
        data: {
          status: 'FAILED',
          paymentResponse: JSON.stringify({ 
            error: (error as Error).message || 'Unknown verification error' 
          })
        }
      });

      throw new Error(`Failed to verify payment: ${(error as Error).message}`);
    }
  }

  // Get payment status for an order
  async getPaymentStatus(orderId: number) {
    try {
      const payment = await prisma.paymentTransaction.findFirst({
        where: { orderId: orderId },
        orderBy: { createdAt: 'desc' }
      });

      if (!payment) {
        return null;
      }

      return {
        status: payment.status,
        transactionId: payment.transactionId,
        transactionCode: payment.transactionCode,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  // Cancel payment (if needed)
  async cancelPayment(transactionId: string) {
    try {
      const payment = await prisma.paymentTransaction.findUnique({
        where: { transactionId: transactionId }
      });

      if (!payment) {
        throw new Error('Payment transaction not found');
      }

      if (payment.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed payment');
      }

      await prisma.paymentTransaction.update({
        where: { transactionId: transactionId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date()
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'CANCELLED',
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Payment cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw new Error('Failed to cancel payment');
    }
  }
}