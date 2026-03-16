WasteLess AI

WasteLess AI is an intelligent platform designed to reduce food waste in e-commerce grocery supply chains using AI-driven inventory analysis, expiry monitoring, and smart decision recommendations.

This project was developed as part of the KodeMaster Hackathon – Open Innovation Track.

Problem Statement

Food waste in e-commerce grocery platforms occurs due to:

Expired products in warehouses
Overstock caused by poor demand prediction
Manual inventory monitoring
Lack of intelligent decision systems

This results in:

Financial losses for businesses
Increased environmental impact
Wasted food that could have been consumed

Solution
WasteLess AI provides a data-driven SaaS dashboard that helps businesses predict and prevent food waste before it happens.
The platform analyzes inventory data and automatically suggests the best action for products that are at risk of expiring.

Example actions:

Apply discounts to near-expiry items
Bundle products to increase sales
Redirect unsold inventory for donation

Key Features :

AI Demand Prediction
Predicts future demand using historical sales data.
Expiry Risk Detection
Identifies products that are close to expiry.
Smart Action Recommendation
Automatically suggests actions such as discounts or redistribution.
Inventory Intelligence Dashboard
Provides a real-time overview of stock levels and risk indicators.
Waste Risk Score
Calculates a risk score for products likely to be wasted.
Sustainability Impact Tracking

Displays metrics such as:

Food saved
Revenue recovered
Environmental impact
System Architecture
The system follows a modern SaaS architecture.

Frontend (React + Tailwind)
        ↓
Backend API
        ↓
AI Prediction Engine
        ↓
Database (Supabase)
        ↓
Analytics Dashboard
Workflow

Admin uploads inventory data
System analyzes expiry dates and stock levels
AI predicts demand and identifies risk
Platform recommends actions (discount / bundle / donation)
Businesses take action and reduce waste

Tech Stack

Frontend

React

TypeScript

TailwindCSS

Vite

Backend / Database

Supabase

Tools

Git

GitHub

Project Structure
src/
public/
supabase/
components/
README.md
package.json
Demo

Demo Video: (Add your demo video link here)

Live Deployment: (Add your deployed project link here)

Installation

Clone the repository:

git clone https://github.com/keval3107/wasteless-ai.git

Navigate to the project folder:

cd wasteless-ai

Install dependencies:

npm install

Run the project:

npm run dev
Future Improvements

Advanced machine learning demand forecasting

Real-time warehouse integration

NGO donation network automation

Multi-warehouse optimization

Team

Team Name: Infinite Coding

Team Leader: Kaival Solanki

Hackathon Track: Open Innovation

License

This project is licensed under the MIT License.
