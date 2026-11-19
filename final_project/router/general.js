const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Check if username already exists
    if (isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    // Register new user
    users.push({ username, password });

    return res.status(201).json({
        message: "User registered successfully"
    });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 2));
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const filteredBooks = Object.keys(books)
        .filter((key) => books[key].author === author)
        .map((key) => books[key]);

    if (filteredBooks.length > 0) {
        return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
    }

    return res.status(404).json({
        message: "No books found for this author"
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const filteredBooks = Object.keys(books)
        .filter((key) => books[key].title === title)
        .map((key) => books[key]);

    if (filteredBooks.length > 0) {
        return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
    }

    return res.status(404).json({
        message: "No books found for this title"
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).send(
            JSON.stringify(books[isbn].reviews, null, 2)
        );
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

// Task 10: Get all books using Async/Await with Axios

const getAllBooks = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');

        console.log("All Books:", response.data);

        return response.data;

    } catch (error) {
        console.error("Error fetching books:", error.message);
        throw error;
    }
};

module.exports.getAllBooks = getAllBooks;

// Task 11: Get book details by ISBN using Axios and Async/Await

const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/isbn/${isbn}`
        );

        console.log("Book Details:", response.data);

        return response.data;

    } catch (error) {
        console.error("Error fetching book:", error.message);
        throw error;
    }
};

module.exports.getBookByISBN = getBookByISBN;


// Task 12: Get books by author using Axios and Async/Await

const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/author/${encodeURIComponent(author)}`
        );

        console.log("Books by Author:", response.data);

        return response.data;

    } catch (error) {
        console.error("Error fetching books:", error.message);
        throw error;
    }
};

module.exports.getBooksByAuthor = getBooksByAuthor;

// Task 13: Get books by title using Axios and Async/Await

const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/title/${encodeURIComponent(title)}`
        );

        console.log("Books by Title:", response.data);

        return response.data;

    } catch (error) {
        console.error("Error fetching books:", error.message);
        throw error;
    }
};

module.exports.getBooksByTitle = getBooksByTitle;

module.exports.general = public_users;
