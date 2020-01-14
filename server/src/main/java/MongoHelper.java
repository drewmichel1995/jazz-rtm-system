import com.mongodb.BasicDBObject;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Random;

public class MongoHelper {

    private static MongoHelper helper = null;
    private static MongoCollection<Document> collection;
    private static MongoDatabase database;
    private static Config cfg;
    private MongoHelper(){
        cfg = new Config();

        System.out.println(cfg.getProperty("mongo"));
        String mongo = cfg.getProperty("mongo");

        //MongoClient mongoClient = MongoClients.create();
        MongoClient mongoClient = MongoClients.create(mongo);
        //MongoClient mongoClient = MongoClients.create("mongodb://mbse-appld10.corp.saic.com");
        database = mongoClient.getDatabase("admin");
        collection = database.getCollection("projectAreas");
    }

    static MongoHelper get(){
        if(helper == null)
            helper = new MongoHelper();

        return helper;
    }

    JSONObject query(String key, String value){
        BasicDBObject whereQuery = new BasicDBObject();
        whereQuery.put(key, value);
        Document documents = collection.find(whereQuery).first();
        return new JSONObject(documents.toJson());
    }

    String storePayload(JSONObject payload){
        MongoCollection<Document> pendingPayloads = database.getCollection("pendingPayloads");
        String uniqueID = generateUniqueID();
        payload.put("UniqueID", uniqueID);
        pendingPayloads.insertOne(Document.parse(payload.toString()));

        Config cfg = new Config();

        JSONObject temp = new JSONObject();
        temp.put("url", cfg.getProperty("clientURL") + "RequirementsView/" + uniqueID);
        temp.put("uniqueID", uniqueID);

        return temp.toString();
    }

    ProjectArea getUniqueIDProject(String uniqueID, ArrayList<String> availableProjects){

            MongoCollection<Document> pendingPayloads = database.getCollection("pendingPayloads");
            BasicDBObject whereQuery = new BasicDBObject();
            whereQuery.put("UniqueID", uniqueID);
            Document documents = pendingPayloads.find(whereQuery).first();
            JSONObject payload = new JSONObject(documents.toJson());
            String projectAreaURI = payload.getString("projectAreaURI");
            String payloadString = payload.getJSONObject("payload").toString();

            if(availableProjects.contains(projectAreaURI)){
                return new ProjectArea(projectAreaURI, new Payload(payloadString));
            }else{
                return new ProjectArea("","", "","");
            }

    }

    ProjectArea getUniqueIDProject(String uniqueID){

        MongoCollection<Document> pendingPayloads = database.getCollection("pendingPayloads");
        BasicDBObject whereQuery = new BasicDBObject();
        whereQuery.put("UniqueID", uniqueID);
        Document documents = pendingPayloads.find(whereQuery).first();
        JSONObject payload = new JSONObject(documents.toJson());
        String projectAreaURI = payload.getString("projectAreaURI");
        String payloadString = payload.getJSONObject("payload").toString();

        return new ProjectArea(projectAreaURI, new Payload(payloadString));
    }

    JSONObject getUniqueIDPayload(String uniqueID){

        MongoCollection<Document> pendingPayloads = database.getCollection("pendingPayloads");
        BasicDBObject whereQuery = new BasicDBObject();
        whereQuery.put("UniqueID", uniqueID);
        Document documents = pendingPayloads.find(whereQuery).first();
        JSONObject payload = new JSONObject(documents.toJson());
        JSONObject payloadBody = payload.getJSONObject("payload");

        return payloadBody;
    }

    boolean collectionExists(String collectionName){
        return database.listCollectionNames().into(new ArrayList<String>()).contains(collectionName);
    }

    MongoCollection<Document> collection(){
        return collection;
    }

    private static String generateUniqueID() {
        String candidateChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        int length = 17;
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(candidateChars.charAt(random.nextInt(candidateChars
                    .length())));
        }

        return sb.toString();
    }

}
