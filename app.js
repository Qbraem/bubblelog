<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BubbleLog</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script type="module" src="app.js"></script>
  <style>
    /* Font import */
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&display=swap');

    body {
      background: linear-gradient(to bottom, #1e3a8a, #2563eb);
      color: #1f2937;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      min-height: 100vh;
      margin: 0;
      padding-top: 56px; /* navbar height */
    }

    nav {
      width: 100%;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      display: flex;
      justify-content: center;
    }
    #profile-container {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #1e40af;
      position: relative;
      font-family: 'Raleway', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      user-select: none;
    }
    #profile-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 11rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      padding: 0.5rem 0;
      z-index: 9999;
      display: none;
      font-weight: 400;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 0.95rem;
      color: #1e40af;
    }
    #profile-dropdown.show {
      display: block !important;
    }
    #profile-toggle {
      font-weight: 700;
      font-family: 'Raleway', sans-serif;
      font-size: 1rem;
      color: #1e40af;
    }

    #header-section {
      max-width: 960px;
      margin: 1rem auto 2rem;
      position: relative;
      background: linear-gradient(to right, #1e40af, #3b82f6, #60a5fa);
      border-radius: 1.5rem;
      height: 160px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      text-align: center;
      user-select: none;
      font-family: 'Raleway', sans-serif;
      font-weight: 700;
      font-size: 3rem;
      letter-spacing: 0.05em;
    }
    #header-section p {
      font-size: 1.5rem;
      margin: 0 0 8px;
      text-shadow: none;
      font-weight: 400;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #header-section .bubble {
      position: absolute;
      bottom: -40px;
      width: 25px;
      height: 25px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: rise 6s infinite ease-in;
    }

    main {
      max-width: 960px;
      margin: 0 auto 4rem;
      background: white;
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 0 0 transparent;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    footer {
      max-width: 960px;
      margin: 2rem auto 2rem;
      background: white;
      border-radius: 1.5rem;
      padding: 1rem 2rem;
      text-align: center;
      font-size: 0.85rem;
      color: #374151;
      font-weight: 600;
      box-shadow: none;
      user-select: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    canvas {
      max-height: 350px;
      width: 100% !important;
    }

    .delete-btn {
      cursor: pointer;
      color: #dc2626;
      font-weight: 600;
      margin-left: 8px;
      user-select: none;
    }
    .delete-btn:hover {
      color: #b91c1c;
    }

    button#auth-submit {
      background-color: #2563eb !important;
      color: white !important;
      font-weight: 600;
      border-radius: 9999px;
      padding: 0.5rem 1rem;
      transition: background-color 0.2s ease-in-out;
      box-shadow: none !important;
      font-family: 'Raleway', sans-serif;
      width: auto;
    }
    button#auth-submit:hover {
      background-color: #1e40af !important;
    }

    /* Bubble animation */
    .bubble {
      animation: rise 6s infinite ease-in;
    }
    .bubble:nth-child(1) { left: 10%; animation-delay: 0s; }
    .bubble:nth-child(2) { left: 30%; animation-delay: 2s; }
    .bubble:nth-child(3) { left: 50%; animation-delay: 4s; }
    .bubble:nth-child(4) { left: 70%; animation-delay: 1s; }
    .bubble:nth-child(5) { left: 90%; animation-delay: 3s; }
    @keyframes rise {
      0% { transform: translateY(0); opacity: 0.5; }
      100% { transform: translateY(-200px); opacity: 0; }
    }

    /* Mobile consistency fixes */
    @media (max-width: 600px) {
      main {
        margin: 1rem 1rem 5rem;
        padding: 1rem;
      }
      #profile-container {
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
      }
      #header-section {
        font-size: 2.5rem;
      }
      button#auth-submit {
        padding: 0.5rem;
        font-size: 1rem;
        max-width: 100%; /* Aangepaste regel */
      }

      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="number"],
      select {
        width: 100% !important;
      }

      #auth-form #extra-register-fields,
      #data-form > div.grid.grid-cols-2 {
        grid-template-columns: 1fr !important;
      }

      #history-container {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      #filter-container {
        width: 100% !important;
      }

      #history,
      #detail-view {
        max-width: 100% !important;
      }

      #charts {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      #charts canvas {
        max-width: 100% !important;
        min-width: auto !important;
        min-height: 300px !important;
      }
    }
  </style>
</head>
<body>
  <nav>
    <div id="profile-container" role="navigation" aria-label="Main Navigation">
      <div class="logo-font" aria-label="App name">BubbleLog</div>
      <div>
        <button id="profile-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="profile-dropdown" class="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A8.966 8.966 0 0112 15a8.966 8.966 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span id="profile-username" class="font-semibold max-w-[140px] truncate"></span>
          <svg xmlns="http://www.w3.org/2000/svg" id="profile-arrow" class="h-4 w-4 text-blue-700 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="profile-dropdown" role="menu" aria-label="User menu" class="hidden">
          <button id="logout-button" role="menuitem" class="block w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none">Logout</button>
          <button id="contact-developer" role="menuitem" class="block w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none">Contact Developer</button>
        </div>
      </div>
    </div>
  </nav>

  <section id="header-section" aria-label="Welcome header">
    <p>Welcome to</p>
    <h1 class="logo-font">BubbleLog</h1>
    <div class="bubble" style="left:10%; animation-delay:0s;"></div>
    <div class="bubble" style="left:30%; animation-delay:2s;"></div>
    <div class="bubble" style="left:50%; animation-delay:4s;"></div>
    <div class="bubble" style="left:70%; animation-delay:1s;"></div>
    <div class="bubble" style="left:90%; animation-delay:3s;"></div>
  </section>

  <main>
    <section id="auth-container">
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800">Login or Register</h2>
      <form id="auth-form" class="grid gap-4" autocomplete="off" novalidate>
        <div id="extra-register-fields" class="hidden grid grid-cols-2 gap-4">
          <input type="text" name="firstname" id="firstname" placeholder="First Name" class="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autocomplete="given-name" />
          <input type="text" name="lastname" id="lastname" placeholder="Last Name" class="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autocomplete="family-name" />
          <input type="text" name="username" id="username" placeholder="Account Name" class="col-span-2 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autocomplete="username" />
          <select name="country" id="country" class="col-span-2 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" >
            <option value="" disabled selected>Select Country</option>
            <option value="Belgium">Belgium</option>
            <option value="Netherlands">Netherlands</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <input type="email" name="email" placeholder="Email" class="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required autocomplete="email" />
        <input type="password" name="password" placeholder="Password" class="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required autocomplete="current-password" />
        <button id="auth-submit" type="submit">Login</button>
        <p class="text-sm text-center text-blue-600 cursor-pointer" id="toggle-link">Don't have an account? Register</p>
      </form>
    </section>

    <section id="dashboard" class="hidden">
      <h2 class="text-xl font-semibold mb-4 text-center text-blue-700">Your Measurements</h2>
      <form id="data-form" class="grid gap-3 mb-6" autocomplete="off" novalidate>
        <div class="grid grid-cols-2 gap-2 text-gray-700 text-xs font-semibold">
          <label for="ph" class="flex items-center gap-1"><span>pH</span><span>(unitless)</span></label>
          <label for="gh" class="flex items-center gap-1"><span>GH</span><span>(°dH)</span></label>
          <label for="kh" class="flex items-center gap-1"><span>KH</span><span>(°dH)</span></label>
          <label for="chlorine" class="flex items-center gap-1"><span>Chlorine</span><span>(mg/L)</span></label>
          <label for="nitrite" class="flex items-center gap-1"><span>Nitrite</span><span>(mg/L)</span></label>
          <label for="nitrate" class="flex items-center gap-1"><span>Nitrate</span><span>(mg/L)</span></label>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <input type="number" step="0.1" id="ph" placeholder="pH" class="border rounded-full px-3 py-2" required />
          <input type="number" step="0.1" id="gh" placeholder="GH" class="
