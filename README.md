# QFR Application

A simple Quotation Management System where **Customers create RFQs**, **Vendors submit bids**, and **Customers review & award bids**.  
This project contains both **Angular Frontend** and **Node.js/Express Backend**.

---

##  Project Structure
QFR-application/
├── backend/ # Node.js + Express + MongoDB API
└── frontend/ # Angular 19 application



## Prerequisites
Make sure you have installed:

- **Node.js** (v16 or above)
- **npm**
- **MongoDB** (local or cloud)
- **Git**
- (Optional) **Angular CLI**

---

##  Installation

### 1. Clone the repository
```bash
git clone https://github.com/pooja-shindhe/QFR-application.git
cd QFR-application

 Backend Setup

cd backend
npm install
Create .env file or You can use mine 
Inside the backend folder:


MONGODB_URI=mongodb://localhost:27017/qfr_db
PORT=4000
JWT_SECRET=your_secret_key

Start the backend
npm start 
or
npm run dev 
Backend runs at:http://localhost:3000


 Frontend Setup
Open another terminal:

cd frontend
npm install

start the Angular app
ng serve --open 
or 
ng s
Frontend opens at: http://localhost:4200



 Basic Usage

Customer
Register/Login

Create RFQ

View vendor bids

Award contract

Vendor
Register/Login

View RFQs

Submit bids
