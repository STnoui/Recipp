# Recipe AI Project Roadmap

This document outlines the development plan for the Recipe AI application. It serves as a to-do list and a place for brainstorming new features.

---

## ✅ **Phase 1: Core Functionality (Completed)**

-   [x] **User Authentication:**
    -   [x] Setup Supabase for user management.
    -   [x] Implement Google OAuth for primary login.
    -   [x] Implement a "Login as Dev" option for development.
-   [x] **Recipe Generation Engine:**
    -   [x] Create a Supabase Edge Function (`generate-recipe`).
    -   [x] Integrate with Google's Gemini AI to generate recipes from images.
    -   [x] Implement a daily usage limit (3 recipes per user per day).
-   [x] **Basic User Interface:**
    -   [x] Create a main page for uploading ingredient photos.
    -   [x] Display the generated recipe in markdown format.
    -   [x] Implement loading skeletons and error alerts for a better user experience.
    -   [x] Basic responsive design for mobile and desktop.

---

## 🎯 **Phase 2: User-Centric Features (Up Next)**

-   [ ] **Recipe History & Management:**
    -   [ ] Create a new database table to store generated recipes linked to a user ID.
    -   [ ] Automatically save every successfully generated recipe.
    -   [ ] Create a "My Recipes" page to display a user's saved recipes.
    -   [ ] Allow users to view, "favorite," and delete recipes from their history.
-   [ ] **User Profile Page:**
    -   [ ] Create a simple profile page.
    -   [ ] Display user information (email, avatar from Google).
    -   [ ] Show usage stats (e.g., "2/3 recipes used today").
-   [ ] **UI/UX Enhancements:**
    -   [ ] Add a "Copy to Clipboard" button for the recipe text.
    -   [ ] Improve the layout of the displayed recipe for better readability.
    -   [ ] Add a persistent dark/light mode toggle in the header.

---

## 🚀 **Phase 3: Advanced Features (Future Ideas)**

-   [ ] **Ingredient Editing:**
    -   [ ] After images are analyzed, show a list of detected ingredients.
    -   [ ] Allow users to add, remove, or correct ingredients before generating the recipe.
-   [ ] **Recipe Customization:**
    -   [ ] Add options to specify dietary preferences (e.g., vegan, gluten-free).
    -   [ ] Allow users to select a desired cuisine style (e.g., Italian, Mexican).
-   [ ] **Shopping List:**
    -   [ ] Add a feature to generate a shopping list from a recipe's ingredients.
-   [ ] **Social & Sharing:**
    -   [ ] Generate a unique, shareable link for a recipe.
    -   [ ] Add social media sharing buttons.

---

## 💡 **Brainstorming & Long-Term Vision**

*   Meal planning functionality (e.g., "plan my week").
*   Nutritional information analysis for recipes.
*   User-submitted recipes and community features.
*   Recipe rating and review system.
*   Monetization: A premium tier for unlimited recipes or advanced features.