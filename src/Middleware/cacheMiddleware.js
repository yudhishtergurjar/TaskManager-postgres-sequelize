import client from "../config/redis.js"
export const cacheMiddleware = (role,ttl=300)=>{//role=proeject,task
    return async (req,res, next)=>{
        try{
            const id = req.params?.id;
            const userId = req.user.userId;
            const key = id 
                ? `user:${userId}:role:${role}:id:${id}`
                : `user:${userId}:role:${role}`;

            const cachedData = await client.get(key);
            if(cachedData){
                console.log("cachedHit data");
                return res.status(200).json(JSON.parse(cachedData));
            }
            console.log("cachedMiss data");

            const originalRes = res.json.bind(res);
            res.json = async (data)=>{
                try{
                    if(res.statusCode == 200)
                    await client.set(key, JSON.stringify(data),{EX:ttl});
                }catch{
                    console.log("error while setting");
                }
                originalRes(data);        
            }
            next();
        }catch(err){
            console.log("error occured",err);
            next();
            
        }
    }
}
