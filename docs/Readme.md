# Application Testing Guide

This guide will walk you through testing the application after starting both the backend and frontend.

## Step 1: User Registration

Register three users: one admin and two regular users.

### First Registration (Admin)

- **Username**: admin
- **Password**: admin
- **Role**: Admin

### Second Registration (User 1)

- **Username**: user1
- **Password**: user1
- **Role**: User

### Third Registration (User 2)

- **Username**: user2
- **Password**: user2
- **Role**: User

## Step 2: Admin Login

1. Log in using the admin credentials.
2. You will be directed to the home page.

## Step 3: Upload Documents

1. Navigate to the document store section.
2. Upload some testing documents from the `store-doc-file` folder above.

## Step 4: Logout Admin

1. Log out of the admin account.

## Step 5: User Login and Testing

1. Log in as either `user1` or `user2`.
2. Test the **scan and matching functionality**.
3. Upload some testing documents from the test-doc-file folder above.
4. Download the matched files to verify the matching score.

## Step 6: Logout User and Check Admin Dashboard

1. Log out of the user account.
2. Log back in as **admin**.
3. Click on **Dashboard** in the top-right corner to view analytics.

## Watch the Testing Process

If you want to watch a step-by-step demonstration, check out my YouTube video:\
[Watch Here](https://youtu.be/BprCBUsasSY)

## Detailed Documentation

For more details, refer to the `official_doc` folder above.

