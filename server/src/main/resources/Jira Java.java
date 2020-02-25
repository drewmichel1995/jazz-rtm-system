import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import static java.time.LocalDateTime.*;
import static spark.Spark.*;

public class Main {

    //Jira Address to gather data from
    private static String jiraServerAddress;

    //Used to create links to issues in the HTML page
    private static String jiraServerAddressEsc;

    //Confluence Address to send the report to
    private static String confluenceServerAddress;

    //Confluence project area where report will be posted
    private static String key;

    //Time range for querying closed and due issues
    private static String range;
    private static String jiraAuth;
    private static String confAuth;

    private static URLfor urlFor;

    //Today's date for Report Title and System messages
    final private static String today = DateTimeFormatter.ofPattern("MM/dd/yyyy").format(now());

    public static void main(String[] args) {

    }

    private static class Issue {
        String id;
        String name;
        String type;

        private Issue(String id, String name, String type){
            this.id = id;
            this.name = name;
            this.type = type;
        }
    }

    private static class Tag {
        String name;
        ArrayList<Issue> closedEpics;
        ArrayList<Issue> closedTasks;
        ArrayList<Issue> inProgressTasks;
        ArrayList<Issue> newEpics;
        ArrayList<Issue> newTasks;

        private Tag(String name){
            this.name = name;
            this.closedEpics = new ArrayList<>();
            this.closedTasks = new ArrayList<>();
            this.inProgressTasks = new ArrayList<>();
            this.newEpics = new ArrayList<>();
            this.newTasks = new ArrayList<>();
        }

        private void setIssue(ArrayList<Issue> issue, String type){
            switch(type) {
                case "closedEpics":
                    this.closedEpics = issue;
                    break;
                case "closedTasks":
                    this.closedTasks = issue;
                    break;
                case "inProgressTasks":
                    this.inProgressTasks = issue;
                    break;
                case "newEpics":
                    this.newEpics = issue;
                    break;
                case "newTasks":
                    this.newTasks = issue;
                    break;
                default:
                    break;
            }
        }
    }

    private static class URLfor {
        String closedEpics;
        String closedTasks;
        String inProgressTasks;
        String newEpics;
        String newTasks;

        private URLfor(String fromDate, String toDate, String tag){
            this.closedEpics = jiraServerAddress + "/rest/api/latest/search?jql=project=SEI%20AND%20issuetype%20=%20epic%20AND%20status%20changed%20to%20Done%20AND%20updatedDate%20%3E%20%22" + fromDate + "%22%20AND%20updatedDate%20%3C%20%22" + toDate + "%22%20AND%20labels%20in%20("+ tag +")";
            this.closedTasks = jiraServerAddress + "/rest/api/latest/search?jql=project=SEI%20AND%20issuetype%20=%20task%20AND%20status%20changed%20to%20Done%20AND%20updatedDate%20%3E%20%22" + fromDate + "%22%20AND%20updatedDate%20%3C%20%22" + toDate + "%22%20AND%20labels%20in%20("+ tag +")";
            this.inProgressTasks = jiraServerAddress + "/rest/api/latest/search?jql=project=SEI%20AND%20issuetype%20=%20task%20AND%20status%20in%20(\"In%20Progress\",\"In%20Review\")%20AND%20updatedDate%20>%20%22"+ fromDate +"%22%20AND%20updatedDate%20<%20%22" + toDate + "%22%20AND%20labels%20in%20("+ tag +")";
            this.newEpics = jiraServerAddress + "/rest/api/latest/search?jql=project=SEI%20AND%20issuetype%20=%20epic%20AND%20created%20%3E%20%22" + fromDate + "%22%20AND%20created%20%3C%20%22" + toDate + "%22%20AND%20labels%20in%20("+ tag +")";
            this.newTasks = jiraServerAddress + "/rest/api/latest/search?jql=project=SEI%20AND%20issuetype%20=%20task%20AND%20created%20%3E%20%22" + fromDate + "%22%20AND%20created%20%3C%20%22" + toDate + "%22%20AND%20labels%20in%20("+ tag +")";
        }

        private String type(String type){
            switch(type) {
                case "closedEpics":
                    return this.closedEpics;
                case "closedTasks":
                    return this.closedTasks;
                case "inProgressTasks":
                    return this.inProgressTasks;
                case "newEpics":
                    return this.newEpics;
                case "newTasks":
                    return this.newTasks;
                default:
                    return "";

            }
        }

        private void printUrls(){
            System.out.println(closedEpics);
            System.out.println(closedTasks);
            System.out.println(inProgressTasks);
            System.out.println(newEpics);
            System.out.println(newTasks);
        }
    }

    private static String handleRequest(String fromDate, String toDate){
        Config cfg = new Config();
        String[] tags = cfg.getProperty("tags").split(",");
        final StringBuilder builder  = new StringBuilder();

        for(String t: tags){
            Tag tag = new Tag(t);
            urlFor = new URLfor(fromDate, toDate, t);
            //urlFor.printUrls();
            tag.setIssue(getIssues("closedEpics"), "closedEpics");
            tag.setIssue(getIssues("closedTasks"), "closedTasks");
            tag.setIssue(getIssues("inProgressTasks"), "inProgressTasks");
            tag.setIssue(getIssues("newEpics"), "newEpics");
            tag.setIssue(getIssues("newTasks"), "newTasks");

            builder.append(getIssueString(tag));
        }
        Date fromDateValue;
        Date toDateValue;
        try{
            SimpleDateFormat input = new SimpleDateFormat("yyyy/MM/dd");
            fromDateValue = input.parse(fromDate);
            toDateValue = input.parse(toDate);

        }catch(Exception e){
            e.printStackTrace();
            fromDateValue = new Date();
            toDateValue = new Date();
        }
        SimpleDateFormat output = new SimpleDateFormat("MM/dd/yyyy");
        String HTMLOut = builder.toString().replace("&", "&amp;");
        String title = cfg.getProperty("title");
        String param = "{\"type\":\"page\",\"title\":\"" + title + output.format(fromDateValue) + " - " + output.format(toDateValue) + "\",\"space\":{\"key\":\"" + key + "\"},\"body\":{\"storage\":{\"value\":\"" + HTMLOut + "\",\"representation\":\"storage\"}}}";
        String response;
        try {
            JSONObject results = new JSONObject(executePost(confluenceServerAddress + "/rest/api/content/", param));
            String link = confluenceServerAddress + "/pages/viewpage.action?pageId=" + results.getInt("id");
            //response = "Jira Weekly Quad Report generated successfully on: " + today + "<br />";
            //response += "The report can be viewed here: <a href=" + link + " target=\"_blank\">" + link + "</a>";
            response = link;
        } catch (Exception ex) {
            response = ex.toString();
            System.out.println(response);
            return response;
        }

        return response;
    }

    private static String executePost(String targetURL, String urlParameters) throws Exception{
        HttpURLConnection connection = null;

        try {
            //Create connection
            URL url = new URL(targetURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type",
                    "application/json; charset=utf-8");
            connection.setRequestProperty("dataType",
                    "json");
            connection.setRequestProperty("Accept",
                    "application/json");
            connection.setRequestProperty("Cache-Control",
                    "no-cache");
            connection.setRequestProperty("Connection",
                    "keep-alive");

            connection.setRequestProperty("Content-Length",
                    Integer.toString(urlParameters.getBytes().length));

            connection.setRequestProperty("Content-Language", "en-US");


            //Set This header for authorization to post pages to confluence
            connection.setRequestProperty("Authorization", "Basic "+ confAuth);

            connection.setUseCaches(false);
            connection.setDoOutput(true);

            //Send request
            DataOutputStream wr = new DataOutputStream (
                    connection.getOutputStream());
            wr.writeBytes(urlParameters);
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
            return response.toString();
        } catch (Exception e) {
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
            connection.setRequestProperty("Content-Type",
                    "application/json;charset=UTF-8");

            //connection.setRequestProperty("Content-Length", "0");
            connection.setRequestProperty("Content-Language", "en-US");

            //authenticate to jira so you can query items
            connection.setRequestProperty("Authorization", "Basic " + jiraAuth);

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

    private static ArrayList<Issue> getIssues(String type){
        ArrayList<Issue> ret = new ArrayList<>();
        JSONArray issues = getIssuesJSON(urlFor.type(type));

        for(int i = 0; i < issues.length(); i++){
            String summary = issues.getJSONObject(i).getJSONObject("fields").getString("summary");
            String id = issues.getJSONObject(i).getString("key");

            ret.add(new Issue(id, summary, type));
        }

        return ret;
    }

    private static JSONArray getIssuesJSON(String url){
        JSONObject obj = new JSONObject(executeGet(url));
        JSONArray issues = obj.getJSONArray("issues");
        int startAt = obj.getInt("startAt");
        int maxResults = obj.getInt("maxResults");
        int total = obj.getInt("total");
        int payload = total - startAt;
        while(maxResults < total && payload > maxResults){

            startAt = startAt + maxResults;

            JSONObject builder = new JSONObject(executeGet(url + "&startAt=" + startAt));
            maxResults = builder.getInt("maxResults");
            total = builder.getInt("total");
            payload = total - startAt;
            JSONArray newIssues = builder.getJSONArray("issues");

            for (int i = 0; i < newIssues.length(); i++) {
                JSONObject jsonObject = newIssues.getJSONObject(i);
                issues.put(jsonObject);
            }
        }

        return issues;
    }
}