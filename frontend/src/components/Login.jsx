import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gapi } from "gapi-script";

const Login = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGapiScript = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/platform.js";
      script.async = true;
      script.defer = true;
      script.onload = initClient;
      document.body.appendChild(script);
    };

    const initClient = () => {
      gapi.load("auth2", () => {
        gapi.auth2
          .init({
            client_id: clientId,
            scope: "profile email",
          })
          .then(() => {
            setIsGapiLoaded(true);
            console.log("Google API client initialized");
          })
          .catch((error) => {
            console.error("Error initializing Google API client:", error);
          });
      });
    };

    loadGapiScript();
  }, [clientId]);

  const onSuccess = (googleUser) => {
    console.log("Login Success: googleUser:", googleUser);
    console.log("Login Success: profileObj:", googleUser.getBasicProfile());
    const idToken = googleUser.getAuthResponse().id_token;
    fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: idToken }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Login Response:", data);
        localStorage.setItem("token", data.token);
        navigate("/create-campaign");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const onFailure = (error) => {
    console.log("Login failed:", error);
  };

  const onClick = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
      authInstance.signIn().then(onSuccess, onFailure);
    } else {
      console.error("Google Auth Instance not initialized");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <button
          onClick={onClick}
          disabled={!isGapiLoaded}
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
            alt="Google logo"
            className="w-6 h-6 mr-2"
          />
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
