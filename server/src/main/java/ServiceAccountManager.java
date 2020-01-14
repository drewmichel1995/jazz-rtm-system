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
