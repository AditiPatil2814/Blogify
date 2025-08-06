import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

const storage = new GridFsStorage({
    // url: `mongodb://patiladiti693:LPkF9NUlJutM1mQc@cluster0-shard-00-00.bjfwq.mongodb.net:27017,cluster0-shard-00-01.bjfwq.mongodb.net:27017,cluster0-shard-00-02.bjfwq.mongodb.net:27017/?ssl=true&replicaSet=atlas-13p84a-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`,
    url: `mongodb+srv://patiladiti693:sCjEBzn1S32uKBBf@cluster0.y12tq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    options: { useNewUrlParser: true },
    file: (request, file) => {
        const match = ["image/png", "image/jpg"];

        if(match.indexOf(file.memeType) === -1) 
            return`${Date.now()}-blog-${file.originalname}`;

        return {
            bucketName: "photos",
            filename: `${Date.now()}-blog-${file.originalname}`
        }
    }
});

export default multer({storage}); 