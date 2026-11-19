const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(
        (user) =>
            user.username === username &&
            user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Validate registered user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        { username },
        "access",
        { expiresIn: "1h" }
    );

    // Store authentication details in session
    req.session.authorization = {
        accessToken: token,
        username: username
    };

    return res.status(200).json({
        message: "User successfully logged in"
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check if review is provided
    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added or updated successfully",
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check if the user has posted a review
    if (!Object.hasOwn(books[isbn].reviews, username)) {
        return res.status(404).json({
            message: "Review not found for this user"
        });
    }

    // Delete only the logged-in user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
