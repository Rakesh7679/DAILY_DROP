import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems, getTrendingItems, incrementViews } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"
import { cacheMiddleware } from "../utils/redis.js"



const itemRouter=express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,cacheMiddleware(300),getItemById)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,cacheMiddleware(180),getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,cacheMiddleware(180),getItemsByShop)
itemRouter.get("/search-items",isAuth,cacheMiddleware(120),searchItems)
itemRouter.post("/rating",isAuth,rating)
itemRouter.post("/increment-views/:itemId",isAuth,incrementViews)
itemRouter.get("/trending/:city",isAuth,cacheMiddleware(300),getTrendingItems)
export default itemRouter