import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shopping cart array
let cart = [
    {
        id: 1,
        productName: "Mouse",
        price: 799,
        quantity: 2
    },
    {
        id: 2,
        productName: "Keyboard",
        price: 1200,
        quantity: 1
    }
];

// Function to send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Function to read request body
function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                resolve(JSON.parse(body));
            }
            catch (error) {
                reject(error);
            }

        });

        req.on("error", reject);

    });

}

// Create HTTP server
const server = http.createServer(async (req, res) => {

    const url = req.url;
    const method = req.method;

    // GET /
    if (url === "/" && method === "GET") {

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end("<h1>Welcome to Shopping Cart Application</h1>");

    }

    // GET /cart
    else if (url === "/cart" && method === "GET") {

        sendJSON(res, 200, cart);

    }

    // GET /about
    else if (url === "/about" && method === "GET") {

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end("<h1>About Shopping Cart Application</h1>");

    }

    // GET /home - Serve HTML using FS module
    else if (url === "/home" && method === "GET") {

        const filePath = path.join(
            __dirname,
            "public",
            "index.html"
        );

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {

                sendJSON(res, 500, {
                    message: "Error reading HTML file"
                });

                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);

        });

    }

    // POST /add-to-cart
    else if (url === "/add-to-cart" && method === "POST") {

        try {

            const product = await readBody(req);

            const { id, productName, price, quantity } = product;

            // Validate product details
            if (
                !Number.isInteger(id) ||
                typeof productName !== "string" ||
                productName.trim() === "" ||
                !Number.isFinite(price) ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                sendJSON(res, 400, {
                    message: "Invalid product details"
                });

                return;
            }

            // Add product to cart
            cart.push(product);

            sendJSON(res, 201, {
                message: "Product added successfully",
                product: product
            });

        }

        catch (error) {

            sendJSON(res, 400, {
                message: "Invalid JSON request"
            });

        }

    }

    // Invalid route
    else {

        sendJSON(res, 404, {
            message: "Route not found"
        });

    }

});

// Start server on port 3000
server.listen(3000, () => {

    console.log(
        "HTTP Server running at http://localhost:3000"
    );

});