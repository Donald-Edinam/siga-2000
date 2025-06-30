# SIGA Content Management Backend

This document provides simple instructions to get the SIGA Content Management Backend up and running on your computer. You don't need to be a technical expert to follow these steps!

## What is this?

This is the "brain" (backend) of a system that helps manage content (like announcements or posts) for SIGA. It stores the information and images, and provides a way for an administrator to add, change, or remove content. It also has a public part where the content can be viewed.

## What you need (Prerequisites)

Before you start, you need to have a program called **Node.js** installed on your computer. It also comes with something called **npm** (Node Package Manager), which we'll use to install other necessary parts of the project.

1.  **Download and Install Node.js:**
    *   Go to the official Node.js website: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
    *   Download the **LTS** (Long Term Support) version for your operating system (Windows, macOS, Linux).
    *   Follow the installation instructions. Usually, you just need to click "Next" a few times.

## How to Run the Project

Follow these steps carefully:

### Step 1: Open your Terminal or Command Prompt

This is a text-based window where you can type commands.
*   **Windows:** Search for "Command Prompt" or "PowerShell" in your Start menu.
*   **macOS:** Search for "Terminal" in Spotlight (Cmd + Space) or find it in Applications > Utilities.
*   **Linux:** Look for "Terminal" in your applications menu.

### Step 2: Navigate to the Project Folder

In your Terminal/Command Prompt, you need to go to the folder where this project's files are located.

Type the following command and press Enter:
```bash
cd /home/kobby/Documents/dev/siga-2000/backend
```
(This command tells your computer to "change directory" to the project folder.)

### Step 3: Install Project Components

Now, we need to install all the small pieces of software (called "packages" or "dependencies") that this project needs to run.

Type the following command and press Enter:
```bash
npm install
```
This might take a minute or two. You'll see some messages scrolling by. Once it's done, you'll see your cursor ready for the next command.

### Step 4: Start the Backend Server

This command will start the "brain" of your application.

Type the following command and press Enter:
```bash
npm start
```
You should see messages like:
`Server running on http://localhost:3001`
`Admin panel available at http://localhost:3001/admin`
`API endpoint: http://localhost:3001/api/posts`

**Important:** Keep this Terminal/Command Prompt window open while you are using the application. If you close it, the server will stop.

### Step 5: Access the Application

Now that the server is running, you can open your web browser (like Chrome, Firefox, Edge, Safari) and go to these addresses:

*   **Admin Panel (for managing content):**
    Open your browser and go to: `http://localhost:3001/admin`

    When you try to access the admin panel, you will be redirected to a login page.
    *   **Username:** `admin`
    *   **Password:** `password`

    After logging in, you will see the content management interface.

*   **Public API (for viewing content):**
    Open your browser and go to: `http://localhost:3001/api/posts`

    This will show you the raw data of all the posts in a format that computers understand (JSON). This part is public and doesn't require a login.

### Step 6: Stopping the Server

When you are finished using the application, go back to the Terminal/Command Prompt window where the server is running (from Step 4).

Press `Ctrl + C` (hold down the `Ctrl` key and press the `C` key) on your keyboard. This will stop the server.

## Important Notes

*   **Data is not saved permanently:** For this demonstration, any new posts you create or changes you make will be lost if you stop and restart the server. This is because the data is currently stored only in the computer's memory, not in a permanent database. For a real application, a database would be used.
*   **Images:** Images you upload will be stored in the `uploads` folder within the project. If you delete this folder or restart the server in a way that clears temporary files, these images might be lost. For a real application, images would be stored in a cloud storage service.

That's it! You should now be able to run and interact with the SIGA Content Management Backend.
