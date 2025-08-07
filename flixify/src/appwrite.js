import {Client,Databases, Query,ID} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);


export const updateSearchCount = async (searchTerm,movie) => {

    try{
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchTerm', searchTerm),
        ])
        if(result.documents.length >0){
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id,{
                count:doc.count+1
            })
        }
        else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(),{
                searchTerm,
                movie_id:movie.id,
                count:1,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }

    }
    catch(e){
        console.error("AppWrite code error",e);
    }


}

export const getTrendingMovies = async () => {
    try{
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,
            [
                Query.limit(10),
                Query.orderDesc("count")
            ])
        return result.documents;
    }
    catch(e){
        console.error("AppWrite code error",e);
    }
}