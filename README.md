# ScanAndGo
# QR Code Login System

A simple QR code-based login system built with **Node.js** and **Express**.

---

## **Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/qr-login-nodejs.git
   cd qr-login-nodejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the application:
   ```bash
   node app.js
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## **API Endpoints**

### **1. Mobile Login**
- **Endpoint**: `POST /mobileLogin`
- **Request Body**:
  ```json
  {
      "phoneNumber": "1234567890"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### **2. QR Code Generation**
- **Endpoint**: `GET /login`
- **Response**: Renders an HTML page with a QR code.

### **3. Validate Token**
- **Endpoint**: `POST /validateToken`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
      "token": "QR_CODE_TOKEN"
  }
  ```
- **Response**:
  ```json
  {
      "success": true
  }
  ```

### **4. Check Login Status**
- **Endpoint**: `POST /checkLogin`
- **Request Body**:
  ```json
  {
      "token": "QR_CODE_TOKEN"
  }
  ```
- **Response**:
  ```json
  {
      "loggedIn": true,
      "phoneNumber": "1234567890"
  }
  ```

### **5. Homepage**
- **Endpoint**: `GET /homepage`
- **Query Parameter**:
  ```
  phoneNumber=1234567890
  ```
- **Response**: Renders a welcome message with the phone number.

---

## **Testing with Postman**

### **1. Mobile Login**
- Send a POST request to `/mobileLogin` with:
  ```json
  {
      "phoneNumber": "1234567890"
  }
  ```

### **2. Validate Token**
- Send a POST request to `/validateToken` with:
  - **Headers**:
    ```
    Authorization: Bearer <JWT_TOKEN>
    ```
  - **Body**:
    ```json
    {
        "token": "QR_CODE_TOKEN"
    }
    ```

### **3. Check Login Status**
- Send a POST request to `/checkLogin` with:
  ```json
  {
      "token": "QR_CODE_TOKEN"
  }
  ```

---

## **Run the Application**
1. Start the server:
   ```bash
   node app.js
   ```

2. Open `http://localhost:3000` in your browser.

3. Scan the QR code with your mobile app or simulate it using Postman.
