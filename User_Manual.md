# Arch-Plan Manager - Cloud Edition User Manual

Welcome to **Arch-Plan Manager**, a fast, secure, and fully cloud-hosted dashboard designed specifically to manage, search, and present your architectural floor plans from anywhere in the world.

## 🚀 Accessing Your App

You no longer need to run any local commands or install Node.js.
1. Simply open your web browser on any device (Desktop, Tablet, or Mobile).
2. Go to your live URL: **[https://planfolio-1.onrender.com](https://planfolio-1.onrender.com)**.
3. You can bookmark this link or save it to your phone's home screen for quick access.

---

## 📂 Managing Floor Plans

### Uploading a Plan
1. Click the golden **Upload File** button in the top right.
2. Fill in the architectural details (Title, Description, Facing, Layout, Property Type, Area).
3. Click the target area at the bottom to attach your native PDF blueprint from your device.
4. Hit **Save**. 
*(Note: Uploads may take a few seconds depending on the PDF size and your internet speed, as the file is being securely transmitted to Cloudinary).*

### Editing or Updating a Plan (Desktop feature)
If you made a typo or want to update the details of a plan, simply **Right-Click** on any plan card in your main dashboard. The upload window will reopen with the plan's details, allowing you to quickly modify the text and click Save.

### Deleting a Plan
1. Click on any plan card to open it in **Presentation Mode**.
2. In the top right corner of the presentation window, click the **Delete** button (marked with a trash can icon).
3. Confirm the deletion. This will permanently remove the record from your MongoDB database. *(To fully remove the PDF file itself to free up storage space, you would log into your Cloudinary dashboard to delete the orphan files).*

---

## ✨ Smart Features

### Natural Language Search
You don't always have to use the dropdown menus to find plans. You can type conversational phrases into the main search bar!
- Example: Type ***"South facing 3 bhk 30x40"*** 
- The smart search engine will automatically extract the facing, bedrooms, and lot size from your sentence and filter the dashboard instantly.

### Smart Recommendations ("You might also like")
When viewing a floor plan in Presentation Mode, the system runs an algorithmic comparison against your entire cloud database. At the bottom of the right panel, it will suggest the top 3 most similar floor plans based on Facing, BHK, Property Type, and Area.

### Drag-and-Drop Organization (Desktop)
Your dashboard is customizable on desktop. Click and hold any plan card, and drag it to a new position. The new order will automatically be saved to your database permanently!

### Dark/Light Mode
The application automatically detects whether your device (Windows, iOS, Android) is set to Dark Mode or Light Mode, and shifts its colors seamlessly to match your eye preferences natively.

---

## ☁️ Cloud Infrastructure (Admin Info)

Your application runs entirely in the cloud, utilizing three distinct free-tier services:
1. **Render.com:** Hosts the backend Node.js server and the website interface. If the site hasn't been used in a while, it may take ~30 seconds to "wake up" the first time you visit it.
2. **MongoDB Atlas:** Stores all text data (titles, notes, sizes, and the organizational order of the dashboard).
3. **Cloudinary:** Securely stores and delivers all PDF media files. You can upload thousands of files within their 25GB free tier limit.
