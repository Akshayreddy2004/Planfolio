# Arch-Plan Manager - User Manual

Welcome to **Arch-Plan Manager**, a fast, secure, and fully offline dashboard designed specifically to manage, search, and present your architectural floor plans.

## 🚀 Getting Started

To run this application on your computer:
1. **Ensure Node.js is installed:** If you haven't already, download and install Node.js from [nodejs.org](https://nodejs.org/).
2. **First-time Setup:** Open the folder containing this application, click the address bar at the top, type `cmd` and press Enter. Then type `npm install` and hit Enter. You only need to do this once.
3. **Run the App:** Simply double-click on the `StartApp.bat` file. A black window will appear (leave it open while you work), and your default web browser will automatically open the dashboard.

---

## ✨ AI-Powered Features

### Natural Language Search
You no longer have to use the dropdown menus to find plans. Simply type conversational phrases into the main search bar!
- Example: Type ***"South facing 3 bhk 30x40"*** 
- The search engine will automatically extract the facing, bedrooms, and lot size from your sentence and filter the dashboard instantly.

### Smart Recommendations ("You might also like")
When viewing a floor plan in Presentation Mode, the system runs an algorithmic comparison against your entire database. At the bottom of the right panel, it will suggest the top 3 most similar floor plans based on Facing, BHK, and Area.

---

## 📂 Managing Floor Plans

### Uploading a Plan
1. Click the red **+ Upload File** button in the top right.
2. Attach your PDF blueprint.
3. Fill in the architectural details (Title, Facing, BHK, Floors, Area).
4. Hit **Save**.

### Editing or Updating a Plan
To edit an existing plan, simply **right-click** on its card in the dashboard. The upload window will reopen with the plan's details, allowing you to quickly fix typos or replace the file.

### Customizing the Order (Drag and Drop)
Your dashboard is completely customizable. Click and hold any plan card, and drag it to a new position. The new order will automatically be saved to your database permanently!

---

## 🧹 Database Management (Important)

**Where is the data stored?** 
Because this app runs offline and locally for maximum security, everything is saved directly inside the application folder:
- **`uploads/` Folder:** All your uploaded PDFs live here.
- **`data.json` File:** This file remembers the text information (Facing, Titles, BHK, Dates) you typed in for each plan.

### How to completely "Wipe" the database for a fresh start:
If you want to clear all the demo data and start with an entirely blank slate:
1. Open the project folder.
2. Delete the **`data.json`** file.
3. Open the **`uploads/`** folder and delete all files inside of it.
4. Restart the application. It will automatically create a fresh, entirely empty database for you!
