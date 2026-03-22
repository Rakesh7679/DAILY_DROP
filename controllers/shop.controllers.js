import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop=async (req,res) => {
    try {
       const {name,city,state,address,latitude,longitude}=req.body
       let image;
       if(req.file){
        console.log(req.file)
        image=await uploadOnCloudinary(req.file.path)
       }
       
       let location = undefined
       if(latitude && longitude){
        location = {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
        }
       }
       
       let shop=await Shop.findOne({owner:req.userId})
       if(!shop){
        const createData = {name,city,state,address,image,owner:req.userId}
        if(location) createData.location = location
        shop=await Shop.create(createData)
       }else{
         const updateData={
            name,city,state,address,owner:req.userId
         }
         if(image){
            updateData.image=image
         }
         if(location){
            updateData.location = location
         }
         shop=await Shop.findByIdAndUpdate(shop._id,updateData,{new:true})
       }
      
       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`create shop error ${error}`})
    }
}

export const getMyShop=async (req,res) => {
    try {
        const shop=await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`get my shop error ${error}`})
    }
}

export const getShopByCity=async (req,res) => {
    try {
        const {city}=req.params

        const shops=await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")}
        }).populate('items')
        if(!shops || shops.length === 0){
            return res.status(200).json([])
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({message:`get shop by city error ${error}`})
    }
}

export const getShopByLocation=async (req,res) => {
    try {
        const {latitude, longitude, maxDistance} = req.query
        
        if(!latitude || !longitude){
            return res.status(400).json({message:"latitude and longitude are required"})
        }

        const distance = maxDistance ? Number(maxDistance) : 10000
        
        const shops = await Shop.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: distance
                }
            }
        }).populate('items')

        console.log(`Location-based search found ${shops.length} shops`)
        return res.status(200).json(shops)
    } catch (error) {
        console.error("Get shop by location error:", error)
        return res.status(500).json({message:`get shop by location error ${error}`})
    }
}