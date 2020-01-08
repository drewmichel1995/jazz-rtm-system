import java.io.*;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.HttpURLConnection;
import java.net.HttpCookie;
import java.net.URL;
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

        //String result = executeGet("https://mbse-rmdev.saic.com:9443/rm/publish/resources?projectURI=" + p.projectUri + "&modifiedSince=" + p.lastUpdated);
        String result = executeGet(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + p.projectUri + "&modifiedSince=" + p.lastUpdated);
        //System.out.println("https://mbse-rmdev.saic.com:9443/rm/publish/resources?projectURI=" + p.projectUri + "&modifiedSince=" + dateFormatGmt.format(new Date()));
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
            System.out.println(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + p.projectUri + "&modifiedSince=" + dateFormatGmt.format(new Date()));
        }
    }

    void getNewProjects(ProjectArea project){
        MongoCollection collection = mongo.collection();

        String result = executeGet(jazzURL + cfg.getProperty("jazzResourcesEndpoint") + project.projectUri);
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

    void insertDataToMongo(){
        MongoCollection<Document> collection = mongo.collection();
        ArrayList<JSONObject> formattedProjects = getProjectJSON(getProjectAreas());
        ArrayList<Document> documents = new ArrayList<>();
        for (JSONObject p : formattedProjects) {
            documents.add(Document.parse(p.toString()));
        }
        collection.insertMany(documents);
    }

    private static ArrayList<JSONObject> getProjectJSON(ArrayList<ProjectArea> projectAreas){
        ArrayList<JSONObject> formattedProjects = new ArrayList<>();
        projectAreas.forEach(p -> {
            JSONObject project = new JSONObject();
            project.put("ProjectAreaName", p.name);
            project.put("ProjectAreaProjectURI", p.projectUri);
            project.put("ProjectAreaURL", p.url);
            project.put("LastUpdated", p.lastUpdated);

            System.out.println("Project Area       : " + p.name);
            System.out.println("Number of Artifacts: " + p.artifacts.size());

            JSONArray artifactArray = new JSONArray();
            p.artifacts.forEach(a -> {
                JSONObject artifactObj = new JSONObject();
                artifactObj.put("ArtifactName", a.name);
                artifactObj.put("ArtifactParentFolder", a.parentFolder);
                artifactObj.put("ArtifactID", a.id);
                artifactObj.put("ArtifactItemID", a.itemId);
                artifactObj.put("ArtifactType", a.artifactType);
                artifactObj.put("ArtifactURL", a.url);

                JSONArray linkArray = new JSONArray();
                a.links.forEach(l -> {
                    JSONObject linkObj = new JSONObject();
                    linkObj.put("LinkID", l.id);
                    linkObj.put("LinkType", l.linkType);
                    linkObj.put("LinkCategory", l.linkCategory);
                    linkObj.put("LinkIsChildLink", l.isChildLink);
                    linkObj.put("LinkIsParentLink", l.isParentLink);

                    linkArray.put(linkObj);
                });

                artifactObj.put("links", linkArray);
                artifactArray.put(artifactObj);
            });
            project.put("artifacts", artifactArray);

            formattedProjects.add(project);
        });

        return formattedProjects;
    }

    private static ArrayList<ProjectArea> getProjectAreas(){
        JSONObject data = new JSONObject("{}");
        try{
            //Sign in

            executePost(authURL);

            String result = executeGet(jazzURL + cfg.getProperty("jazzProjectAreaEndpoint"));
            data = XML.toJSONObject(result);

        }catch(Exception ex){
            System.out.println("BROKED");
        }

        ArrayList<ProjectArea> projectAreas = new ArrayList<>();

        JSONArray projectAreasData = data.getJSONObject("jp06:project-areas").getJSONArray("jp06:project-area");
        for(int i =0; i < projectAreasData.length(); i++){
            String url = projectAreasData.getJSONObject(i).getString("jp06:url");
            String name = projectAreasData.getJSONObject(i).getString("jp06:name");
            String projectUri = url.split("/")[6];
            String lastUpdated = dateFormatGmt.format(new Date());
            projectAreas.add(new ProjectArea(url, name, projectUri, lastUpdated));
        }

        return getArtifacts(projectAreas);
    }

    private static ArrayList<ProjectArea> getArtifacts(ArrayList<ProjectArea> projectAreas){
        projectAreas.forEach(p -> {
            String url = jazzURL + cfg.getProperty("jazzResourcesEndpoint")  + p.projectUri + "&size=500";
            String result = executeGet(url);

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

        });

        return projectAreas;
    }

    private static String executePost(String targetURL) throws Exception{
        HttpURLConnection connection = null;

        try {
            //Create connection
            CookieManager cookieManager = new CookieManager();
            CookieHandler.setDefault(cookieManager);



            URL url = new URL(targetURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");


            connection.setUseCaches(false);
            connection.setDoOutput(true);


            String jazzAuth = cfg.getProperty("jazzAuth");

            //Send request
            DataOutputStream wr = new DataOutputStream (connection.getOutputStream());
            wr.writeBytes(jazzAuth);
            wr.flush();
            wr.close();

            //Get Response
            InputStream is = connection.getInputStream();

            BufferedReader rd = new BufferedReader(new InputStreamReader(is));
            StringBuilder response = new StringBuilder(); // or StringBuffer if Java version 5+
            String line;
            while ((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            rd.close();

            List<HttpCookie> cookies = cookieManager.getCookieStore().getCookies();

            System.out.println("Cookie:::::::" + cookies.toString());

            int code =  connection.getResponseCode();

            return response.toString();
            //return Integer.toString(code);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String executeGet(String targetURL) {
        HttpURLConnection connection = null;

        try {
            URL url = new URL(targetURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

            connection.setUseCaches(false);
            connection.setDoOutput(true);

            //Get Response
            InputStream is = connection.getInputStream();
            BufferedReader rd = new BufferedReader(new InputStreamReader(is));
            StringBuilder response = new StringBuilder(); // or StringBuffer if Java version 5+
            String line;
            while ((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            rd.close();
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static ArrayList<Artifact> artifactPagination(ArrayList<Artifact> artifacts, String next){

        while(!next.equals("")){
            String result = executeGet(next);
            System.out.println(next);

            try{
                JSONObject jsonObject = XML.toJSONObject(result);

                JSONArray jsonArtifacts = jsonObject.getJSONObject("ds:dataSource").getJSONArray("ds:artifact");

                try{
                    next = jsonObject.getJSONObject("ds:dataSource").getString("href");
                }catch(Exception ex){
                    next = "";
                }
                for(int i = 0; i < jsonArtifacts.length(); i++){
                    JSONObject obj = jsonArtifacts.getJSONObject(i);

                    String name = obj.getJSONObject("rrm:title").getString("content");
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
                //e.printStackTrace();
            }
        }

        return artifacts;
    }
}
