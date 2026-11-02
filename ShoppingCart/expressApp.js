import express from "express";

const app = express();
app.use(express.json());

let cart = [
    {
        id: 1,
        productName: "Wireless Mouse",
        price: 799,
        quantity: 2,
        category: "Electronics"
    },
    {
        id: 2,
        productName: "Keyboard",
        price: 1200,
        quantity: 1,
        category: "Electronics"
    },
    {
        id: 3,
        productName: "Headphones",
        price: 1499,
        quantity: 2,
        category: "Electronics"
    }
];

// Calculate total price
function calculateTotal(product) {
    return {
        ...product,
        totalPrice: product.price * product.quantity
    };
}

// GET all cart products
app.get("/cart", (req, res) => {
    const result = cart.map(calculateTotal);
    res.status(200).json(result);
});

// GET product by ID
app.get("/cart/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = cart.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.status(200).json(calculateTotal(product));
});

// POST add new product
app.post("/cart", (req, res) => {
    const { id, productName, price, quantity, category } = req.body;

    if (
        !Number.isInteger(id) ||
        typeof productName !== "string" ||
        productName.trim() === "" ||
        !Number.isFinite(price) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        return res.status(400).json({
            message: "Invalid product details"
        });
    }

    const existing = cart.find(item => item.id === id);

    if (existing) {
        return res.status(409).json({
            message: "Product ID already exists"
        });
    }

    const newProduct = {
        id,
        productName,
        price,
        quantity,
        category: category || "General"
    };

    cart.push(newProduct);

    res.status(201).json({
        message: "Product added successfully",
        product: calculateTotal(newProduct)
    });
});

// PUT update product
app.put("/cart/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = cart.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const {
        productName,
        price,
        quantity,
        category
    } = req.body;

    const updatedProduct = {
        ...product,
        ...(productName !== undefined && { productName }),
        ...(price !== undefined && { price }),
        ...(quantity !== undefined && { quantity }),
        ...(category !== undefined && { category })
    };

    if (
        typeof updatedProduct.productName !== "string" ||
        updatedProduct.productName.trim() === "" ||
        !Number.isFinite(updatedProduct.price) ||
        !Number.isInteger(updatedProduct.quantity) ||
        updatedProduct.quantity <= 0
    ) {
        return res.status(400).json({
            message: "Invalid product details"
        });
    }

    Object.assign(product, updatedProduct);

    res.status(200).json({
        message: "Product updated successfully",
        product: calculateTotal(product)
    });
});

// DELETE product
app.delete("/cart/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = cart.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = cart.splice(index, 1)[0];

    res.status(200).json({
        message: "Product deleted successfully",
        product: calculateTotal(deletedProduct)
    });
});

// Invalid route
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Error handling
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON request"
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
});

app.listen(4000, () => {
    console.log("Express Server running at http://localhost:4000");
});