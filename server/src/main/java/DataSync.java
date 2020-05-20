import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


import com.mongodb.client.*;
import org.bson.Document;
import org.json.*;

import static com.mongodb.client.model.Filters.eq;

public class DataSync {

    private static SimpleDateFormat dateFormatGmt;
    private static MongoHelper mongo;
    private static String authURL;
    private static String jazzURL;
    private static Config cfg = new Config();
    private static ServiceAccountManager service = new ServiceAccountManager();

    public DataSync(){
        authURL = cfg.getProperty("authURL");
        jazzURL = cfg.getProperty("jazzURL");
        mongo = MongoHelper.get();
        dateFormatGmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
    }

    ArrayList<ProjectArea> getMongoProjects(){
        return JSONtoProjectArea(loadDataFromMongo());
    }

    void getNewData(ProjectArea p){

        MongoCollection<Document> collection = mongo.collection();

        String result = service.executeGet(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + p.projectUri + "&modifiedSince=" + p.lastUpdated);

        JSONObject data = XML.toJSONObject(result);

        try{
            if(data.getJSONObject("ds:dataSource").getJSONArray("ds:artifact").length() > 0){
                System.out.println("New data found for " + p.name + " at " + dateFormatGmt.format(new Date()));
                ArrayList<ProjectArea> projectArea = new ArrayList<>();
                projectArea.add(new ProjectArea(p.url, p.name, p.projectUri, dateFormatGmt.format(new Date())));
                JSONObject jsonData = getArtifacts(projectArea).get(0).toJSON();
                collection.deleteOne(eq("ProjectAreaProjectURI", p.projectUri));
                collection.insertOne(Document.parse(jsonData.toString()));
            }
        }catch(Exception ex){
            System.out.println("No new data for " + p.name + " at " + dateFormatGmt.format(new Date()) + " URL Tested: " + jazzURL + cfg.getProperty("jazzResourcesEndpoint") + p.projectUri + "&modifiedSince=" + dateFormatGmt.format(new Date()));
            //System.out.println(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + p.projectUri + "&modifiedSince=" + dateFormatGmt.format(new Date()));
            System.out.println(" ");
        }
    }

    void getNewProjects(ProjectArea project){
        MongoCollection collection = mongo.collection();
        String result = service.executeGet(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + project.projectUri);
        //System.out.println("https://mbse-rmdev.saic.com:9443/rm/publish/resources?projectURI=" + p.projectUri + "&modifiedSince=" + dateFormatGmt.format(new Date()));
        JSONObject data = XML.toJSONObject(result);

        try{
            if(data.getJSONObject("ds:dataSource").getJSONArray("ds:artifact").length() > 0){
                System.out.println("Creating Mongo Document For: " + project.name + " at " + dateFormatGmt.format(new Date()));
                ArrayList<ProjectArea> projectArea = new ArrayList<>();
                projectArea.add(project);
                JSONObject jsonData = getArtifacts(projectArea).get(0).toJSON();
                collection.insertOne(Document.parse(jsonData.toString()));
            }
        }catch(Exception ex){
            System.out.println("Adding Empty Mongo Document For: " + project.name);
            JSONObject jsonData = project.toJSON();
            collection.insertOne(Document.parse(jsonData.toString()));
        }
    }

    private static ArrayList<ProjectArea> JSONtoProjectArea(ArrayList<JSONObject> projects){
        ArrayList<ProjectArea> retProjects =  new ArrayList<>();

        //ProjectAreas
        for(JSONObject j: projects){
            ProjectArea temp = new ProjectArea(j.getString("ProjectAreaURL"), j.getString("ProjectAreaName"), j.getString("ProjectAreaProjectURI"), j.getString("LastUpdated"));
            JSONArray artifactArray = j.getJSONArray("artifacts");

            //Artifacts
            for(int i = 0; i < artifactArray.length(); i++){
                JSONObject a  = artifactArray.getJSONObject(i);

                Artifact tempArtifact = new Artifact(a.getString("ArtifactName"), a.getString("ArtifactParentFolder"), a.getString("ArtifactID"), a.getString("ArtifactItemID"), a.getString("ArtifactType"), a.getString("ArtifactURL"));
                JSONArray linkArray = a.getJSONArray("links");

                //Links
                for(int q = 0; q < linkArray.length(); q++){
                    JSONObject l = linkArray.getJSONObject(q);

                    Link tempLink = new Link(l.getString("LinkID"), l.getString("LinkType"), l.getString("LinkCategory"), l.getBoolean("LinkIsChildLink"), l.getBoolean("LinkIsParentLink"));
                    tempArtifact.addLink(tempLink);
                }

                temp.addArtifact(tempArtifact);

            }

            retProjects.add(temp);
        }

        return retProjects;
    }

    private static ArrayList<JSONObject> loadDataFromMongo(){
        MongoCollection<Document> collection = mongo.collection();
        List<Document> documents = collection.find().into(new ArrayList<>());
        ArrayList<JSONObject> projects = new ArrayList<>();
        for(Document document : documents){
            JSONObject temp = new JSONObject(document.toJson());
            projects.add(temp);
        }
        return projects;
    }

    private static ArrayList<ProjectArea> getArtifacts(ArrayList<ProjectArea> projectAreas){
        projectAreas.forEach(p -> {
            String url = jazzURL + cfg.getProperty("jazzResourcesEndpoint")  + p.projectUri + "&size=500";
            String result = service.executeGet(url);

            try{
                JSONObject jsonObject =  XML.toJSONObject(result);


                JSONArray artifacts = jsonObject.getJSONObject("ds:dataSource").getJSONArray("ds:artifact");
                String next;
                try{
                    next = jsonObject.getJSONObject("ds:dataSource").getString("href");
                }catch(Exception ex){
                    next = "";
                }

                for(int i = 0; i < artifacts.length(); i++){
                    JSONObject obj = artifacts.getJSONObject(i);

                    String name = obj.getJSONObject("rrm:title").getString("content");
                    String id = Integer.toString(obj.getJSONObject("rrm:identifier").getInt("content"));
                    String artifactType = obj.getJSONObject("rrm:collaboration").getJSONObject("rrm:attributes").getJSONObject("attribute:objectType").getString("attribute:name");
                    String itemId = obj.getString("attribute:itemId");
                    String parentFolder;
                    String artifactUrl = obj.getString("rrm:about");
                    Artifact artifact = new Artifact("","","","","", "");
                    try{
                        parentFolder = obj.getJSONObject("ds:location").getJSONObject("ds:parentFolder").getString("rrm:title");
                        artifact = new Artifact(artifactType, id, itemId, name, parentFolder, artifactUrl);
                    }catch(JSONException ex){ }

                    try{
                        JSONArray jsonLinks = obj.getJSONObject("ds:traceability").getJSONObject("ds:links").getJSONArray("ds:Link");
                        for(int j = 0; j < jsonLinks.length(); j++){
                            JSONObject linkObj = jsonLinks.getJSONObject(j);
                            String linkId = linkObj.getString("rrm:relation");
                            linkId = linkId.substring(linkId.lastIndexOf('/') + 1);
                            String linkType = linkObj.getString("rrm:title");
                            String linkCategory = linkObj.getString("type");
                            boolean isChildLink = false;
                            boolean isParentLink = false;

                            artifact.addLink(new Link(linkId, linkType, linkCategory, isChildLink, isParentLink));
                        }

                    }catch(Exception ex){
                        try{
                            JSONObject linkObj = obj.getJSONObject("ds:traceability").getJSONObject("ds:links").getJSONObject("ds:Link");
                            String linkId = linkObj.getString("rrm:relation");
                            linkId = linkId.substring(linkId.lastIndexOf('/') + 1);
                            String linkType = linkObj.getString("rrm:title");
                            String linkCategory = linkObj.getString("type");
                            boolean isChildLink = false;
                            boolean isParentLink = false;
                            artifact.addLink(new Link(linkId, linkType, linkCategory, isChildLink, isParentLink));
                        }catch(Exception ex2){ }
                    }

                    if(!artifact.parentFolder.equals("")){
                        p.addArtifact(artifact);
                    }

                }

                
                if(!next.equals("")){
                    p.setArtifacts(artifactPagination(p.artifacts, next));
                }

                
            } catch (Exception e) {
                //e.printStackTrace();
            }
            p.setModules(service.getModules(p.projectUri));
        });

        return projectAreas;
    }

    private static ArrayList<Artifact> artifactPagination(ArrayList<Artifact> artifacts, String next){
        while(!next.equals("")){
            String result = service.executeGet(next);
            System.out.println(next);
            JSONObject jsonObject = XML.toJSONObject(result);
            try{


                JSONArray jsonArtifacts = jsonObject.getJSONObject("ds:dataSource").getJSONArray("ds:artifact");

                try{
                    next = jsonObject.getJSONObject("ds:dataSource").getString("href");
                }catch(Exception ex){
                    next = "";
                }
                for(int i = 0; i < jsonArtifacts.length(); i++){
                    JSONObject obj = jsonArtifacts.getJSONObject(i);

                    String name = obj.getJSONObject("rrm:title").get("content").toString();
                    String id = Integer.toString(obj.getJSONObject("rrm:identifier").getInt("content"));
                    String artifactType = obj.getJSONObject("rrm:collaboration").getJSONObject("rrm:attributes").getJSONObject("attribute:objectType").getString("attribute:name");
                    String itemId = obj.getString("attribute:itemId");
                    String artifactUrl = obj.getString("rrm:about");
                    String parentFolder;
                    Artifact artifact = new Artifact("", "", "", "", "", "");
                    try{
                        parentFolder = obj.getJSONObject("ds:location").getJSONObject("ds:parentFolder").getString("rrm:title");
                        artifact = new Artifact(artifactType, id, itemId, name, parentFolder, artifactUrl);
                    }catch(JSONException ex){}

                    try{
                        JSONArray jsonLinks = obj.getJSONObject("ds:traceability").getJSONObject("ds:links").getJSONArray("ds:Link");
                        //String id, String linkType, String linkCategory, String isChildLink, String isParentLink
                        for(int j = 0; j < jsonLinks.length(); j++){
                            JSONObject linkObj = jsonLinks.getJSONObject(j);
                            String linkId = linkObj.getString("rrm:relation");
                            linkId = linkId.substring(linkId.lastIndexOf('/') + 1);
                            String linkType = linkObj.getString("rrm:title");
                            String linkCategory = linkObj.getString("type");
                            boolean isChildLink = false;
                            boolean isParentLink = false;

                            artifact.addLink(new Link(linkId, linkType, linkCategory, isChildLink, isParentLink));
                        }

                    }catch(Exception ex){
                        try{
                            JSONObject linkObj = obj.getJSONObject("ds:traceability").getJSONObject("ds:links").getJSONObject("ds:Link");
                            String linkId = linkObj.getString("rrm:relation");
                            linkId = linkId.substring(linkId.lastIndexOf('/') + 1);
                            String linkType = linkObj.getString("rrm:title");
                            String linkCategory = linkObj.getString("type");
                            boolean isChildLink = false;
                            boolean isParentLink = false;
                            artifact.addLink(new Link(linkId, linkType, linkCategory, isChildLink, isParentLink));
                        }catch(Exception ex2){ }
                    }

                    if(!artifact.parentFolder.equals("")){
                        artifacts.add(artifact);
                    }

                }


            } catch (Exception e) {
                System.out.println("----------------------------------------------------------------------------------");
                e.printStackTrace();
            }
        }

        return artifacts;
    }
}
