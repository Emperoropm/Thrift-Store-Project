const API_URL = "http://localhost:3000/api";

async function register() {
    const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });

    const data = await res.json();
    if (res.ok) {
        alert("Registration successful! Please login.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    } else {
        alert(`Error: ${data.message || "Registration failed"}`);
    }
}

async function login() {
    console.log("🔍 [DEBUG] login() called");
    
    const user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        console.log("📤 Sending login request...");
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        console.log(`📡 Login response status: ${res.status}`);
        const data = await res.json();
        console.log("📋 Login response data:", data);
        
        if (data.token) {
            console.log("✅ Login successful, token received");
            localStorage.setItem("token", data.token);
            
            // Check if user data is already in the login response
            if (data.user || data.data) {
                console.log("👤 User data found in login response");
                const userData = data.user || data.data;
                localStorage.setItem("user", JSON.stringify(userData));
                console.log("💾 User data saved from login response");
                
                console.log("🔀 Redirecting to index.html...");
                window.location.href = "index.html";
                return;
            }
            
            console.log("🔄 Attempting to fetch user profile...");
            await fetchUserProfile(data.token);
            
            console.log("🔀 Proceeding to redirect...");
            window.location.href = "index.html";
        } else {
            console.error("❌ Login failed - no token in response");
            alert(data.message || "Login failed");
        }
    } catch (error) {
        console.error("💥 Network/login error:", error);
        alert("Network error. Please try again.");
    }
}
// Inside the fetchUserProfile function in your login.html script, add logging:
async function fetchUserProfile(token) {
    console.log("🔍 [DEBUG] Starting fetchUserProfile...");
    console.log("📦 Token first 10 chars:", token.substring(0, 10) + "...");
    
    try {
        // Try multiple potential endpoints
        const endpoints = [
            `${API_URL}/users/me`,
            `${API_URL}/auth/profile`,
            `${API_URL}/auth/verify`
        ];
        
        let userData = null;
        
        for (const endpoint of endpoints) {
            console.log(`🔄 Trying endpoint: ${endpoint}`);
            try {
                const res = await fetch(endpoint, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                console.log(`📡 Response for ${endpoint}: Status ${res.status}`);
                
                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Success! Got data:", data);
                    
                    // Check different response formats
                    if (data.user) {
                        userData = data.user;
                    } else if (data.data) {
                        userData = data.data;
                    } else {
                        userData = data;
                    }
                    
                    localStorage.setItem("user", JSON.stringify(userData));
                    console.log("💾 User data saved to localStorage");
                    break;
                } else {
                    const errorText = await res.text();
                    console.log(`❌ Endpoint failed: ${errorText}`);
                }
            } catch (endpointError) {
                console.log(`❌ Endpoint error: ${endpointError.message}`);
            }
        }
        
        if (!userData) {
            console.log("⚠️ No user endpoint worked. Using token payload directly.");
            
            // Extract user info from token (JWT)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("🔓 Decoded token payload:", payload);
                
                userData = {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role,
                    name: payload.name
                };
                
                localStorage.setItem("user", JSON.stringify(userData));
                console.log("💾 Created user data from token");
            } catch (decodeError) {
                console.error("❌ Couldn't decode token:", decodeError);
            }
        }
        
        return userData;
        
    } catch (error) {
        console.error("💥 Critical error in fetchUserProfile:", error);
        return null;
    }
}

// Function to check auth status and update UI
async function checkAuthAndUpdateUI() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token) {
        // If we have token but no user data, fetch it
        if (!user) {
            const userData = await fetchUserProfile(token);
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData));
                updateAuthUI(userData);
            } else {
                // Clear invalid token
                localStorage.removeItem("token");
                updateAuthUI(null);
            }
        } else {
            try {
                const userData = JSON.parse(user);
                updateAuthUI(userData);
            } catch (e) {
                localStorage.removeItem("user");
                updateAuthUI(null);
            }
        }
    } else {
        updateAuthUI(null);
    }
}

// Function to update UI based on auth status
function updateAuthUI(userData) {
    const authContainer = document.getElementById('auth-container');
    
    if (!authContainer) {
        console.log("auth-container element not found!");
        return;
    }
    
    if (userData) {
        // User is logged in
        console.log("User is logged in, showing user info for:", userData.name);
        authContainer.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <span class="font-medium text-gray-700">Hi, ${userData.name || 'User'}</span>
                </div>
                <a href="profile.html" class="px-3 py-2 text-gray-600 hover:text-green-600 font-medium">
                    Profile
                </a>
                <button id="logout-button" class="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
                    Logout
                </button>
            </div>
        `;
        
        // Add event listener after the button is created
        setTimeout(() => {
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                console.log("Logout button found, adding event listener");
                logoutButton.addEventListener('click', function() {
                    console.log("Logout button clicked!");
                    logout();
                });
            } else {
                console.log("Logout button NOT found!");
            }
        }, 100);
    } else {
        // User is not logged in
        console.log("User is not logged in, showing login/signup buttons");
        authContainer.innerHTML = `
            <div class="flex items-center space-x-4">
                <a href="login.html" class="px-4 py-2 text-gray-700 hover:text-green-600 font-medium">Login</a>
                <a href="register.html" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300">Sign Up</a>
            </div>
        `;
    }
}
// Function to logout with simple confirmation
function logout() {
    console.log("logout() function executing...");
    
    // Ask for confirmation using browser's confirm dialog
    if (!confirm("Are you sure you want to logout?")) {
        console.log("User cancelled logout");
        return; // User clicked "Cancel"
    }
    
    console.log("User confirmed logout");
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    console.log("LocalStorage cleared");
    
    // Update UI if on a page with auth-container
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        console.log("Updating auth container UI");
        authContainer.innerHTML = `
            <div class="flex items-center space-x-4">
                <a href="login.html" class="px-4 py-2 text-gray-700 hover:text-green-600 font-medium">Login</a>
                <a href="register.html" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300">Sign Up</a>
            </div>
        `;
    }
    
    // Show a success message
    alert("You have been logged out successfully!");
    console.log("Showed logout success alert");
    
    // Redirect to homepage
    console.log("Redirecting to index.html");
    window.location.href = "index.html";
}

// Export ALL functions for use in HTML
window.login = login;
window.register = register;
window.logout = logout;
window.checkAuthAndUpdateUI = checkAuthAndUpdateUI;
window.updateAuthUI = updateAuthUI;
window.fetchUserProfile = fetchUserProfile;

console.log("auth.js loaded successfully!");
console.log("logout function available:", typeof logout !== 'undefined');