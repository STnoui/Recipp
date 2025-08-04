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

## ✅ **Phase 2: User-Centric Features (In Progress)**

-   [x] **Recipe History & Management:**
    -   [x] Create a new database table to store generated recipes linked to a user ID.
    -   [x] Automatically save every successfully generated recipe.
    -   [x] Create a "My Recipes" page to display a user's saved recipes.
    -   [x] Allow users to view, "favorite," and delete recipes from their history.
-   [x] **User Profile & Settings Menu:**
    -   [x] Create a slide-out menu for account management.
    -   [x] Display user information (name, avatar from Google).
    -   [x] Implement account deletion functionality.
-   [x] **UI/UX Enhancements:**
    -   [ ] Add a "Copy to Clipboard" button for the recipe text.
    -   [x] Improve the layout of the displayed recipe for better readability.
    -   [x] Add a persistent dark/light mode toggle in the account menu.

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

### **Functionality & Intelligence**
*   **Meal Planning:** "Plan my meals for the next 3 days using these ingredients."
*   **Nutritional Analysis:** Automatically calculate and display estimated calories, protein, carbs, and fats for a recipe.
*   **Pantry Tracker:** A virtual pantry where users can log ingredients they have at home. The app could then suggest recipes based on what's available.
*   **Recipe Scaling:** "This recipe is for 2 people, can you scale it for 6?"
*   **Wine/Drink Pairing:** Suggest a wine or other beverage that would go well with the meal.
*   **Leftover Ideas:** "I have leftover chicken and rice, what can I make?"
*   **Advanced Customization:**
    *   **Skill Level:** Specify cooking skill (beginner, intermediate, expert) for simpler or more complex recipes.
    *   **Appliance-Specific:** "I have an air fryer and a slow cooker, what can I make?"
    *   **Time Constraints:** "Give me a recipe that takes less than 30 minutes."
    *   **Flavor Profile:** "Make it spicier," "less salty," or "more savory."
*   **Ingredient Substitution AI:** "I don't have butter, what can I use instead?"
*   **Occasion-Based Suggestions:** "I need a recipe for a romantic dinner" or "a quick weekday lunch for kids."

### **Design & User Experience**
*   **Interactive Cooking Mode:**
    *   **Voice Commands & Read-Aloud:** For hands-free cooking, allow users to navigate recipe steps with voice commands ("Hey Chef, next step").
    *   **Dynamic Timers:** Clickable timers embedded directly in the instruction steps.
    *   **Checklists:** Interactive checklists for ingredients and steps.
*   **Gamification:** Introduce badges and achievements for trying new cuisines, cooking consistently, or mastering a difficult recipe.
*   **Personalized Dashboard:** A home screen with personalized suggestions, recently viewed recipes, and a "what's in season" section.
*   **Visual Identity:**
    *   **Theming:** Offer different color themes beyond light/dark (e.g., "Mint," "Tomato," "Sage").
    *   **Custom Illustrations:** Unique food-related icons and illustrations for empty states, loading screens, and alerts.
    *   **Polished Animations:** Subtle, delightful animations for page transitions and interactions.
*   **AI-Generated Food Photos:** Use an image generation model to create a beautiful photo of the final dish based on the recipe text.
*   **Print-Friendly Format:** A button to generate a clean, minimalist print version of the recipe.

### **Community & Social Features**
*   **Recipe Ratings & Reviews:** Allow users to give a 1-5 star rating and leave comments or photos of their creations.
*   **Community Cookbook:** A public feed of the highest-rated recipes generated by the community.
*   **Follows & Feeds:** Allow users to follow other home cooks and see what they're making.
*   **Cooking Challenges:** Weekly or monthly challenges (e.g., "Pancake Week") where users can submit their creations.
*   **Private Groups:** Allow users to create private groups with friends or family to share recipes and meal plans.

### **Monetization & Platform Growth**
*   **Premium Tier ("Recipe Pro"):**
    *   Increased daily limit (e.g., 10 generations/day).
    *   "Family Plan": Invite a friend to share the daily generation limit.
    *   Saving unlimited recipes to history.
    *   Access to all customization and dietary filters.
*   **Strategic Partnerships:**
    *   **Branded Content:** Collaborate with food brands to feature their products as recommended ingredients.
    *   **Affiliate Links:** Partner with grocery delivery services or online stores.
*   **Platform Expansion:**
    *   **API Access:** Offer a paid API for other apps or websites to use the recipe generation engine.
    *   **E-commerce:** Sell kitchen gadgets, high-quality ingredients, or branded merchandise directly through the app.
*   **Cross-Platform Presence:**
    *   **Native Mobile Apps:** Develop dedicated iOS and Android apps.
    *   **Smart Speaker Skills:** Create skills for Amazon Alexa and Google Assistant.
    *   **Offline Mode:** Allow access to saved recipes without an internet connection.