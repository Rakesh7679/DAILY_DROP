import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";
import Item from "./models/item.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected for seeding");
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

// Sample food images (using placeholder images)
const foodImages = {
    biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400",
    momos: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400",
    friedRice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
    samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    iceCream: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400",
    gulabjamun: "https://images.unsplash.com/photo-1666190094768-15a0cfbda7a0?w=400",
    sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
    thali: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    chicken: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
    fish: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400",
};

const shopImages = {
    restaurant1: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    restaurant2: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
    restaurant3: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    restaurant4: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    restaurant5: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
};

const seedData = async () => {
    try {
        // Clear existing data (optional - comment out if you don't want to clear)
        // await User.deleteMany({ role: "owner" });
        // await Shop.deleteMany({});
        // await Item.deleteMany({});
        // console.log("Cleared existing data");

        const hashedPassword = await bcrypt.hash("password123", 10);

        // Create Owner Users
        const owners = [
            {
                fullName: "Rahul Sharma",
                email: "rahul.foodzone@gmail.com",
                password: hashedPassword,
                mobile: "9876543210",
                role: "owner",
            },
            {
                fullName: "Priya Patel",
                email: "priya.tastybites@gmail.com",
                password: hashedPassword,
                mobile: "9876543211",
                role: "owner",
            },
            {
                fullName: "Amit Kumar",
                email: "amit.spicekitchen@gmail.com",
                password: hashedPassword,
                mobile: "9876543212",
                role: "owner",
            },
            {
                fullName: "Sneha Das",
                email: "sneha.bengaliflavors@gmail.com",
                password: hashedPassword,
                mobile: "9876543213",
                role: "owner",
            },
            {
                fullName: "Vikram Singh",
                email: "vikram.punjabidhabha@gmail.com",
                password: hashedPassword,
                mobile: "9876543214",
                role: "owner",
            },
        ];

        const createdOwners = [];
        for (const owner of owners) {
            const existingUser = await User.findOne({ email: owner.email });
            if (existingUser) {
                console.log(`Owner ${owner.email} already exists, skipping...`);
                createdOwners.push(existingUser);
            } else {
                const newOwner = await User.create(owner);
                createdOwners.push(newOwner);
                console.log(`Created owner: ${owner.fullName}`);
            }
        }

        // Create Shops
        const shopsData = [
            {
                name: "Food Zone Restaurant",
                image: shopImages.restaurant1,
                city: "Barasat",
                state: "West Bengal",
                address: "12, Station Road, Barasat",
                ownerIndex: 0,
            },
            {
                name: "Tasty Bites",
                image: shopImages.restaurant2,
                city: "Barasat",
                state: "West Bengal",
                address: "45, College Para, Barasat",
                ownerIndex: 1,
            },
            {
                name: "Spice Kitchen",
                image: shopImages.restaurant3,
                city: "Barasat",
                state: "West Bengal",
                address: "78, Kazipara, Barasat",
                ownerIndex: 2,
            },
            {
                name: "Bengali Flavors",
                image: shopImages.restaurant4,
                city: "Barasat",
                state: "West Bengal",
                address: "23, Talpukur Road, Barasat",
                ownerIndex: 3,
            },
            {
                name: "Punjabi Dhaba",
                image: shopImages.restaurant5,
                city: "Barasat",
                state: "West Bengal",
                address: "56, Jessore Road, Barasat",
                ownerIndex: 4,
            },
        ];

        const createdShops = [];
        for (const shopData of shopsData) {
            const owner = createdOwners[shopData.ownerIndex];
            const existingShop = await Shop.findOne({ owner: owner._id });
            
            if (existingShop) {
                console.log(`Shop for ${owner.fullName} already exists, skipping...`);
                createdShops.push(existingShop);
            } else {
                const shop = await Shop.create({
                    name: shopData.name,
                    image: shopData.image,
                    city: shopData.city,
                    state: shopData.state,
                    address: shopData.address,
                    owner: owner._id,
                    items: [],
                });
                createdShops.push(shop);
                console.log(`Created shop: ${shopData.name}`);
            }
        }

        // Create Items for each shop
        const itemsData = [
            // Food Zone Restaurant items
            { name: "Chicken Biryani", image: foodImages.biryani, category: "Biryani", foodType: "non veg", price: 220, shopIndex: 0 },
            { name: "Mutton Biryani", image: foodImages.biryani, category: "Biryani", foodType: "non veg", price: 280, shopIndex: 0 },
            { name: "Veg Fried Rice", image: foodImages.friedRice, category: "Chinese", foodType: "veg", price: 150, shopIndex: 0 },
            { name: "Chicken Momos", image: foodImages.momos, category: "Chinese", foodType: "non veg", price: 80, shopIndex: 0 },
            
            // Tasty Bites items
            { name: "Margherita Pizza", image: foodImages.pizza, category: "Pizza", foodType: "veg", price: 199, shopIndex: 1 },
            { name: "Pepperoni Pizza", image: foodImages.pizza, category: "Pizza", foodType: "non veg", price: 299, shopIndex: 1 },
            { name: "Classic Burger", image: foodImages.burger, category: "Burgers", foodType: "non veg", price: 149, shopIndex: 1 },
            { name: "Veg Burger", image: foodImages.burger, category: "Burgers", foodType: "veg", price: 129, shopIndex: 1 },
            
            // Spice Kitchen items
            { name: "Paneer Butter Masala", image: foodImages.paneer, category: "North Indian", foodType: "veg", price: 180, shopIndex: 2 },
            { name: "Butter Chicken", image: foodImages.chicken, category: "North Indian", foodType: "non veg", price: 220, shopIndex: 2 },
            { name: "Dal Makhani", image: foodImages.thali, category: "North Indian", foodType: "veg", price: 150, shopIndex: 2 },
            { name: "Chicken Curry", image: foodImages.chicken, category: "North Indian", foodType: "non veg", price: 200, shopIndex: 2 },
            
            // Bengali Flavors items
            { name: "Masala Dosa", image: foodImages.dosa, category: "South Indian", foodType: "veg", price: 80, shopIndex: 3 },
            { name: "Fish Curry", image: foodImages.fish, category: "Main Course", foodType: "non veg", price: 180, shopIndex: 3 },
            { name: "Rasgulla", image: foodImages.gulabjamun, category: "Desserts", foodType: "veg", price: 60, shopIndex: 3 },
            { name: "Sandesh", image: foodImages.iceCream, category: "Desserts", foodType: "veg", price: 50, shopIndex: 3 },
            
            // Punjabi Dhaba items
            { name: "Chole Bhature", image: foodImages.thali, category: "North Indian", foodType: "veg", price: 120, shopIndex: 4 },
            { name: "Tandoori Chicken", image: foodImages.chicken, category: "North Indian", foodType: "non veg", price: 280, shopIndex: 4 },
            { name: "Samosa", image: foodImages.samosa, category: "Snacks", foodType: "veg", price: 20, shopIndex: 4 },
            { name: "Lassi", image: foodImages.iceCream, category: "Others", foodType: "veg", price: 50, shopIndex: 4 },
        ];

        for (const itemData of itemsData) {
            const shop = createdShops[itemData.shopIndex];
            
            // Check if item already exists in shop
            const existingItem = await Item.findOne({ 
                name: itemData.name, 
                shop: shop._id 
            });
            
            if (existingItem) {
                console.log(`Item ${itemData.name} already exists in ${shop.name}, skipping...`);
                continue;
            }

            const item = await Item.create({
                name: itemData.name,
                image: itemData.image,
                category: itemData.category,
                foodType: itemData.foodType,
                price: itemData.price,
                shop: shop._id,
            });

            // Add item to shop's items array
            shop.items.push(item._id);
            await shop.save();
            console.log(`Created item: ${itemData.name} in ${shop.name}`);
        }

        console.log("\n✅ Seeding completed successfully!");
        console.log(`Created ${createdOwners.length} owners`);
        console.log(`Created ${createdShops.length} shops`);
        console.log(`Created ${itemsData.length} food items`);
        
        console.log("\n📝 Owner Login Credentials:");
        console.log("Password for all: password123");
        owners.forEach(o => console.log(`  - ${o.email}`));

    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        mongoose.connection.close();
        console.log("\nDB connection closed");
    }
};

// Run the seed
connectDb().then(() => seedData());
