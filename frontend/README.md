 # SIGA Content Management Frontend
    2 
    3 This document provides simple instructions to get the SIGA Content
      Management Frontend up and running on your computer. This is the
      part of the application you interact with in your web browser.
    4 
    5 ## What is this?
    6 
    7 This is the user interface (UI) or the "frontend" of the SIGA
      Content Management system. It's what you see and click on in your
      web browser. It communicates with the "backend" (the other part of
      the project) to display, add, edit, and delete content.
    8 
    9 ## What you need (Prerequisites)
   10 
   11 Before you start, you need to have **Node.js** installed on your
      computer. It also comes with **npm** (Node Package Manager), which
      we'll use to install other necessary parts of the project.
   12 
   13 1.  **Download and Install Node.js:**
   14     *   Go to the official Node.js website: [
      https://nodejs.org/en/download/](https://nodejs.org/en/download/)
   15     *   Download the **LTS** (Long Term Support) version for your
      operating system (Windows, macOS, Linux).
   16     *   Follow the installation instructions.
   17 
   18 ## How to Run the Project
   19 
   20 Follow these steps carefully:
   21 
   22 ### Step 1: Ensure the Backend is Running
   23 
   24 **Important:** This frontend application needs the backend server to
      be running to function correctly. Please make sure you have followed
      the instructions in the backend's `README.md` to start the backend
      server first.
   25 
   26 ### Step 2: Open a NEW Terminal or Command Prompt
   27 
   28 If your backend server is running in one Terminal/Command Prompt
      window, open a **new** one. You'll need two separate windows: one
      for the backend and one for the frontend.
   29 
   30 ### Step 3: Navigate to the Frontend Project Folder
   31 
   32 In your new Terminal/Command Prompt, you need to go to the folder
      where this frontend project's files are located.
   33 
   34 Type the following command and press Enter:

  cd siga-2000/frontend


   1 (This command tells your computer to "change directory" to the
     frontend project folder.)
   2 
   3 ### Step 4: Install Project Components
   4 
   5 Now, we need to install all the small pieces of software (called
     "packages" or "dependencies") that this frontend needs to run.
   6 
   7 Type the following command and press Enter:

  npm install


   1 This might take a minute or two. You'll see some messages scrolling 
     by. Once it's done, you'll see your cursor ready for the next 
     command.
   2 
   3 ### Step 5: Start the Frontend Development Server
   4 
   5 This command will start the frontend application and open it in your
     browser.
   6 
   7 Type the following command and press Enter:

  npm run dev


    1 This command will usually open a new tab in your web browser
      automatically, showing the application. If it doesn't, you will see 
      a message in your Terminal/Command Prompt indicating the address 
      (e.g., `http://localhost:5173/`). Copy that address and paste it 
      into your browser's address bar.
    2 
    3 **Important:** Keep this Terminal/Command Prompt window open while
      you are using the application. If you close it, the frontend will
      stop working.
    4 
    5 ### Step 6: Stopping the Frontend Server
    6 
    7 When you are finished using the application, go back to the Terminal
      /Command Prompt window where the frontend server is running (from
      Step 5).
    8 
    9 Press `Ctrl + C` (hold down the `Ctrl` key and press the `C` key) on
      your keyboard. This will stop the frontend server.
   10 
   11 ## Important Notes
   12 
   13 *   **Backend Connection:** Remember that this frontend relies on
      the backend server. If the backend is not running, the frontend will
      not be able to load or save any content.
   14 *   **Login:** When you access the admin panel through the frontend,
      you will be prompted to log in. Use the credentials provided in the
      backend's documentation.
   15 
   16 That's it! You should now be able to run and interact with the SIGA 
      Content Management Frontend.