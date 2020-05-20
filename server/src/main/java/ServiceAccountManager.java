import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ServiceAccountManager {

    static Config cfg;
    static CookieManager cookieManager;
    public ServiceAccountManager(){
        cfg = new Config();
    }

    void dataCheck(){
        String authURL = cfg.getProperty("authURL");
        try{
            cookieManager = new CookieManager(null, CookiePolicy.ACCEPT_ALL);

            CookieHandler.setDefault(cookieManager);
            //authenticate with Jazz Server
            executePost(authURL, cfg.getProperty("jazzAuth"));
            ArrayList<ProjectArea> uris = getProjectAreas();

            syncProjects();

        }catch(Exception ex){
            ex.printStackTrace();
        }
    }

    private static void syncProjects(){
        DataSync sync = new DataSync();
        ArrayList<ProjectArea> newProjects = checkForNewProjects();
        ArrayList<ProjectArea> existingProjects = sync.getMongoProjects();
        if(newProjects.size() > 0){
            newProjects.forEach(p -> {
                try{
                    System.out.println("Adding data for: " + p.name);
                    //Add service account to project area
                    String memberURL = cfg.getProperty("jazzURL") + cfg.getProperty("jazzAddMembersEndpoint1") + p.projectUri + cfg.getProperty("jazzAddMembersEndpoint2");
                    executePost(memberURL, getMemberPayload(p.projectUri));
                    sync.getNewProjects(p);

                    //Delete service account from project area
                    String deleteURL = cfg.getProperty("jazzURL") + cfg.getProperty("jazzAddMembersEndpoint1") + p.projectUri + cfg.getProperty("jazzAddMembersEndpoint2") + "/srvc-csee-jazz";
                    executeDelete(deleteURL);
                }catch(Exception ex){
                    ex.printStackTrace();
                }
            });
        }

        existingProjects.forEach(p -> {
            try{
                //Add service account to project area
                String memberURL = cfg.getProperty("jazzURL") + cfg.getProperty("jazzAddMembersEndpoint1") + p.projectUri + cfg.getProperty("jazzAddMembersEndpoint2");
                executePost(memberURL, getMemberPayload(p.projectUri));

                sync.getNewData(p);

                //Delete service account from project area
                String deleteURL = cfg.getProperty("jazzURL") + cfg.getProperty("jazzAddMembersEndpoint1") + p.projectUri + cfg.getProperty("jazzAddMembersEndpoint2") + "/srvc-csee-jazz";
                executeDelete(deleteURL);
            }catch(Exception ex){
                ex.printStackTrace();
            }
        });



    }

    public ArrayList<Module> getModules(String projectUri){
        JSONObject data = XML.toJSONObject(executeGet("https://mbse-rmdev.saic.com:9443/rm/publish/modules?projectURI=" + projectUri));
        JSONArray modulesJSON;

        try{
            modulesJSON = data.getJSONObject("ds:dataSource").getJSONArray("ds:artifact");
        }catch(Exception ex){
            modulesJSON = new JSONArray();
            try{
                System.out.println("Attempting Single Artifact");
                modulesJSON.put(data.getJSONObject("ds:dataSource").getJSONObject("ds:artifact"));

            }catch(Exception ex2){
                System.out.println("No Artifacts Found");
                modulesJSON = new JSONArray();
            }
        }

        ArrayList<Module> modules = new ArrayList<>();

        for(int i =0; i < modulesJSON.length(); i++){
            JSONObject moduleJSON = modulesJSON.getJSONObject(i);
            Module module = getModuleArtifacts(parseModule(moduleJSON));

            modules.add(module);
        }

        return modules;
    }

    private Module getModuleArtifacts(Module module){
        JSONObject moduleData = XML.toJSONObject(executeGet("https://mbse-rmdev.saic.com:9443/rm/publish/resources?moduleURI=" + module.itemId)).getJSONObject("ds:dataSource");
        JSONArray moduleArtifacts = new JSONArray();

        try{
            //FileWriter riter = new FileWriter( module.itemId + ".txt", true);
            //riter.write(moduleData.toString(10));
            //riter.close();
            moduleArtifacts = moduleData.getJSONArray("ds:artifact");
        }catch(Exception ex){
            try{
                JSONObject moduleArtifact = moduleData.getJSONObject("ds:artifact");
                moduleArtifacts.put(moduleArtifact);
            }catch(Exception ex2){
                ex2.printStackTrace();
            }
        }

        for(int i = 0; i < moduleArtifacts.length(); i++){
            JSONObject moduleArtifact = moduleArtifacts.getJSONObject(i);
            Artifact newArtifact = parseModuleArtifact(moduleArtifact);

            try{
                JSONObject traceability = moduleArtifact.getJSONObject("ds:traceability");
                ArrayList<Link> links = parseModuleLinks(traceability);
                links.forEach(l -> {
                    newArtifact.addLink(l);
                });

            }catch(Exception ex){
                System.out.println("No Links found for " + newArtifact.name);
            }

            module.addArtifact(newArtifact);
        }

        return module;
        //JSONArray moduleArtifacts
    }

    private ArrayList<Link> parseModuleLinks(JSONObject traceability){
        JSONArray JSONLinks = new JSONArray();
        try{
            JSONLinks = traceability.getJSONObject("ds:links").getJSONArray("ds:Link");
        }catch(Exception ex){
            try{
                JSONObject JSONLink = traceability.getJSONObject("ds:links").getJSONObject("ds:Link");
                JSONLinks.put(JSONLink);
            }catch(Exception ex2){

            }
        }

        ArrayList<Link> links = new ArrayList<>();

        for(int i = 0; i < JSONLinks.length(); i++){
            JSONObject JSONLink = JSONLinks.getJSONObject(i);
            String id = Integer.toString(JSONLink.getInt("rrm:identifier"));
            String title = JSONLink.getJSONObject("ds:content").getString("rrm:title");
            String description = JSONLink.getJSONObject("ds:content").getString("rrm:description");
            String format = JSONLink.getJSONObject("ds:content").getString("rrm:format");
            String artifactFormat = JSONLink.getJSONObject("ds:content").getString("ds:artifactFormat");
            String type = JSONLink.getString("type");
            String linkTitle = JSONLink.getString("rrm:title");

            links.add(new Link(id, title, description, format, artifactFormat, type, linkTitle));
        }

        return links;
    }

    private Artifact parseModuleArtifact(JSONObject moduleArtifact){
        String name;
        try{
            name = moduleArtifact.getJSONObject("rrm:title").getString("content");
        }catch(Exception ex){
            name = "Undefined";
        }

        String artifactType = moduleArtifact.getJSONObject("rrm:collaboration").getJSONObject("rrm:attributes").getJSONObject("attribute:objectType").getString("attribute:name");
        String id = Integer.toString(moduleArtifact.getJSONObject("rrm:identifier").getInt("content"));
        String itemId = moduleArtifact.getJSONObject("rrm:title").getString("attribute:itemId");
        String parentFolder = "";
        String moduleString = "";
        String url = moduleArtifact.getString("rrm:about");
        String format = moduleArtifact.getJSONObject("rrm:format").getString("content");

        return new Artifact(artifactType, id, itemId, name, parentFolder, moduleString, url, format);
    }

    private Module parseModule(JSONObject moduleJSON){
        String name;
        try{
            name = moduleJSON.getJSONObject("rrm:title").getString("content");
        }catch(Exception ex){
            name = moduleJSON.getJSONObject("rrm:title").toString(5);
        }

        String id = Integer.toString(moduleJSON.getJSONObject("rrm:identifier").getInt("content"));
        String parentFolder = moduleJSON.getJSONObject("ds:location").getJSONObject("ds:parentFolder").getString("rrm:title");
        String format = moduleJSON.getJSONObject("rrm:format").getString("content");
        String moduleItemID = moduleJSON.getString("attribute:itemId");
        String type;
        try{
            type = moduleJSON.getJSONObject("rrm:collaboration").getJSONObject("rrm:attributes").getJSONObject("attributes:objectType").getString("attribute:name");
        }catch(Exception ex){
            type = "";
        }

        String url = moduleJSON.getString("rrm:about");

        Module module = new Module(name, id, moduleItemID, parentFolder, format, type, url);

        return module;
    }

    private static String getJsessionId(){
        try{
            List<HttpCookie> cookies = cookieManager.getCookieStore().getCookies();
            ArrayList<String> JSESSIONID = new ArrayList<>();
            for(HttpCookie c : cookies){
                if(c.toString().contains("JSESSIONID")){
                    JSESSIONID.add(c.toString().split("JSESSIONID=")[1]);
                }
            }

            if(JSESSIONID.isEmpty()){
                return "";
            }

            return JSESSIONID.get(1);
        }catch(Exception ex){
            return "";
        }

    }

    private static ArrayList<ProjectArea> checkForNewProjects(){
        DataSync sync = new DataSync();
        ArrayList<ProjectArea> mongoProjects = sync.getMongoProjects();
        ArrayList<ProjectArea> jazzProjects = getProjectAreas();
        ArrayList<ProjectArea> newProjects = new ArrayList<>();

        for(ProjectArea proj: jazzProjects){
            Boolean isThere = false;
            for(ProjectArea mongoProj: mongoProjects){
                if(mongoProj.projectUri.equals(proj.projectUri)){
                    isThere = true;
                }
            }

            if(!isThere){
                newProjects.add(proj);
            }
        }

        return newProjects;
    }

    private static ArrayList<ProjectArea> getProjectAreas(){
        JSONObject data = new JSONObject("{}");
        SimpleDateFormat dateFormatGmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
        try{

            String result = executeGet(cfg.getProperty("jazzURL") + cfg.getProperty("jazzProjectAreaEndpoint"));
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

        return projectAreas;
    }

    private static String getMemberPayload(String uri){
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<jp06:members xmlns:jp06=\"http://jazz.net/xmlns/prod/jazz/process/0.6/\">\n" +
                "    <jp06:member>\n" +
                "        <jp06:user-url>https://mbse-jtsdev.saic.com:9443/jts/users/srvc-csee-jazz</jp06:user-url>\n" +
                "        <jp06:role-assignments>\n" +
                "            <jp06:role-assignment>\n" +
                "                <jp06:role-url>https://mbse-rmdev.saic.com:9443/rm/process/project-areas/" + uri + "/roles/Administrator</jp06:role-url>\n" +
                "            </jp06:role-assignment>\n" +
                "        </jp06:role-assignments>\n" +
                "    </jp06:member>\n" +
                "</jp06:members>";
    }

    static String executeGet(String targetURL) {
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

    static int executePost(String targetURL, String payload) throws Exception{
        HttpURLConnection connection = null;

        try {
            URL url = new URL(targetURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

            if(!getJsessionId().equals(""))
                connection.setRequestProperty("X-Jazz-CSRF-Prevent", getJsessionId());

            connection.setUseCaches(false);
            connection.setDoOutput(true);

            //Send request
            DataOutputStream wr = new DataOutputStream (connection.getOutputStream());
            wr.writeBytes(payload);
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

            return connection.getResponseCode();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    static int executeDelete(String targetURL) throws Exception{
        HttpURLConnection connection = null;

        try {
            URL url = new URL(targetURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("DELETE");
            connection.setRequestProperty("X-Jazz-CSRF-Prevent", getJsessionId());

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

            return connection.getResponseCode();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
