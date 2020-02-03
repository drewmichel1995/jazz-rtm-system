import java.io.*;

import java.util.*;

import org.json.*;
import spark.Response;

import static spark.Spark.get;
import static spark.Spark.post;


public class JazzHTTP {

    public static void main(String[] args) {

        MongoHelper mongo = MongoHelper.get();
        ServiceAccountManager service = new ServiceAccountManager();

        /*
        * Load Data form Jazz if Mongo doesn't have data
         */
        if(!mongo.collectionExists("projectAreas")){
            loadData();
        }

        /*
        * Timer to check for projectArea
        * updates on Jazz Server
        */
        int MINUTES = 2;
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                service.dataCheck();
            }
        }, 0, 1000 * 60 * MINUTES);

        get("/", (req, res) -> {

            System.out.println("Received Request /");
            String file = "template.html";
            getRes(res, "text/html");

            return mongo.getClass().getResourceAsStream(file);
        });

        /*  /refreshData
         *
         *  Parameters: None
         *  Triggers a data sync function to load, format, and store
         *  all project areas from IBM Jazz to MongoDB
         *
         * */
        get("/refreshData", (req, res) -> {

            System.out.println("Received Request /refreshData");
            service.dataCheck();
            getRes(res, "application/json");

            return res;
        });

        /*  /loadData
         *
         *  Parameters: None
         *  Triggers a data sync function to load, format, and store
         *  all project areas from IBM Jazz to MongoDB
         *
         * */
        get("/loadData", (req, res) -> {

            System.out.println("Received Request /loadData");
            loadData();
            getRes(res, "application/json");

            return res;
        });


        /*  /getFields
         *
         *  Parameters: ProjectURI
         *  Retrieves a JSONObject containing fields
         *  needed to populate template.html
         *
         * */
        get("/getFields/:projectURI", (req, res) -> {

            System.out.println("Received Request /getFields");
            ProjectArea project = new ProjectArea(req.params(":projectURI"));
            getRes(res, "application/json");

            return project.getFields();
        });

        get("/getLoadedTable/:uniqueID", (req, res) -> {

            try{
                System.out.println("Received Request /getLoadedTable");
                System.out.println("Cookie: " + req.cookie("jazz_rtm_cookie"));
                ProjectArea project = mongo.getUniqueIDProject(req.params(":uniqueID"), decodeCookie(req.cookie("jazz_rtm_cookie")));
                getRes(res, "application/json");

                if(!project.name.equals("")){
                    JSONObject temp = new JSONObject();
                    temp.put("success", true);
                    temp.put("payload", project.getTableJSON(mongo.getUniqueIDPayload(req.params(":uniqueID"))));
                    temp.put("fields", project.getFields());
                    return temp;
                }else{
                    JSONObject temp = new JSONObject();
                    temp.put("success", false);
                    return temp.toString();
                }
            }catch(Exception ex){
                ex.printStackTrace();
            }
            return false;
        });

        get("/getFormattedPayload/:uniqueID", (req, res) -> {

            System.out.println("Received Request /getFormattedPayload");
            ProjectArea project = mongo.getUniqueIDProject(req.params(":uniqueID"), decodeCookie(req.cookie("jazz_rtm_cookie")));
            getRes(res, "application/json");
            if(!project.name.equals("")){
                JSONObject temp = project.getTableJSON(mongo.getUniqueIDPayload(req.params(":uniqueID")));
                temp.put("success", true);
                return temp;
            }else{
                JSONObject temp = new JSONObject();
                temp.put("success", false);
                return temp.toString();
            }
        });

        get("/getProjectAreaSize/:uniqueID", (req, res) -> {

            try{
                System.out.println("Received Request /getProjectAreaSize");
                ProjectArea project = mongo.getUniqueIDProject(req.params(":uniqueID"));
                getRes(res, "application/json");

                JSONObject temp = new JSONObject();
                temp.put("rowSize", project.rowArtifacts.size());
                temp.put("columnSize", project.columnArtifacts.size());

                return temp.toString();
            }catch(Exception ex){
                ex.printStackTrace();
                return false;
            }
        });

        get("/getWidget", (req, res) -> {

            System.out.println("Received Request /getWidget");
            String file = "test.xml";
            getRes(res, "text/xml");

            return readBytes(file);
        });

        get("/getHTMLWidget", (req, res) -> {

            System.out.println("Received Request /getHTMLWidget");
            String file = "widget.html";
            getRes(res, "text/html");

            return readBytes(file);
        });

        get("/getAnalytics/:projectURI", (req, res) -> {
            JSONObject temp = new JSONObject();
            try{
                if(decodeCookie(req.cookie("jazz_rtm_cookie")).contains(req.params(":projectURI"))){
                    System.out.println("Received Request /getAnalytics");
                    AnalyticsHelper analytics = new AnalyticsHelper(req.params(":projectURI"));
                    getRes(res, "application/json");

                    temp.put("success", true);
                    temp.put("analytics", analytics.toJSON());

                    return temp.toString();
                }
            }catch(Exception ex){

            }

            temp.put("success", false);
            temp.put("analytics", new JSONObject());
            return temp.toString();
        });

        post("/tableJSON/:projectURI", (req, res) -> {

            System.out.println("Received Request /tableJSON");
            System.out.println("ProjectURI " + req.params(":projectURI"));
            System.out.println("Payload " + req.body());
            ProjectArea project = new ProjectArea(req.params(":projectURI"), new Payload(req.body()));
            getRes(res, "application/json");

            return project.getTableJSON();
        });

        post("/storePayload/", (req, res) -> {

            System.out.println("Received Request /storePayload");
            getRes(res, "application/json");

            return mongo.storePayload(new JSONObject(req.body()));
        });

        post("/getCookie/", (req, res) -> {
            System.out.println("Received Request /getCookie");
            JSONObject JSONPayload = new JSONObject(req.body());

            try{
                String projectAreas = JSONPayload.getJSONArray("projectAreas").toString();
                String encodedString = Base64.getEncoder().encodeToString(projectAreas.getBytes());
                JSONPayload = new JSONObject();
                JSONPayload.put("cookie", encodedString);

                res.status(200);
                res.type("application/json");

                res.header("Access-Control-Allow-Origin", "https://mbse-rmdev.saic.com:9443");
                res.header("Access-Control-Allow-Credentials", "true");
                res.cookie("/", "jazz_rtm_cookie", encodedString, 60*60*24, false, true);
                return true;
            }catch(Exception ex){
                ex.printStackTrace();
                return false;
            }
        });

        get("/decodeCookie/", (req, res) -> {
            System.out.println("Received Request /decodeCookie");

            decodeCookie(req.cookie("jazz_rtm_cookie"));

            return true;
        });
    }

    private static String readBytes(String filename) {

        InputStream is = JazzHTTP.class.getResourceAsStream(filename);
        InputStreamReader isr = new InputStreamReader(is);
        BufferedReader br = new BufferedReader(isr);
        StringBuffer sb = new StringBuffer();

        try{

           String line;
           while ((line = br.readLine()) != null)
           {
               sb.append(line + "\r\n");
           }
           br.close();
           isr.close();
           is.close();

       }catch(Exception ex){
           ex.printStackTrace();
       }

        return sb.toString();
    }

    private static Response getRes(Response res, String type){
        res.status(200);
        res.type(type);
        //res.header("Access-Control-Allow-Origin", "http://mbse-appld10.corp.saic.com");
        res.header("Access-Control-Allow-Origin", "https://mbse-rmdev.saic.com:9443");

        return res;
    }

    private static ArrayList<String> decodeCookie(String cookie){
        byte[] byteArray = Base64.getDecoder().decode(cookie.getBytes());
        String decodedString = new String(byteArray);
        System.out.println(decodedString);
        JSONArray arr = new JSONArray(decodedString);
        ArrayList<String> ret = new ArrayList<>();
        for(int i = 0; i < arr.length(); i++){
            ret.add(arr.getJSONObject(i).getString("uri"));
        }

        return ret;
    }

    private static void loadData() {
        ServiceAccountManager service = new ServiceAccountManager();
        service.dataCheck();
    }
}

