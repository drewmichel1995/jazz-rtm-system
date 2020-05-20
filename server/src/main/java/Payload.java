import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;

public class Payload {
    ArrayList<String> rows;
    ArrayList<String> columns;
    ArrayList<String> rowTypes;
    ArrayList<String> columnTypes;
    ArrayList<String> dependencies;
    String showHeaders;
    Boolean linksOnly;
    Boolean showModules;


    public Payload(String body){
        System.out.println(body);
        JSONObject scopes = new JSONObject(body);
        this.showModules = scopes.getBoolean("showModules");
        if(this.showModules){
            this.rows = JSONArrayToArrayList(scopes.getJSONObject("module").getJSONArray("rows"));
            this.columns = JSONArrayToArrayList(scopes.getJSONObject("module").getJSONArray("columns"));
            this.rowTypes = JSONArrayToArrayList(scopes.getJSONObject("module").getJSONArray("rowTypes"));
            this.columnTypes = JSONArrayToArrayList(scopes.getJSONObject("module").getJSONArray("columnTypes"));
            this.dependencies = JSONArrayToArrayList(scopes.getJSONObject("module").getJSONArray("linkTypes"));
        }else{
            this.rows = JSONArrayToArrayList(scopes.getJSONArray("rows"));
            this.columns = JSONArrayToArrayList(scopes.getJSONArray("columns"));
            this.rowTypes = JSONArrayToArrayList(scopes.getJSONArray("rowTypes"));
            this.columnTypes = JSONArrayToArrayList(scopes.getJSONArray("columnTypes"));
            this.dependencies = JSONArrayToArrayList(scopes.getJSONArray("dependencies"));
        }

        this.showHeaders = scopes.getString("showHeader");
        this.linksOnly = scopes.getBoolean("linksOnly");
    }

    private static ArrayList<String> JSONArrayToArrayList(JSONArray array){
        String key = "name";
        ArrayList<String> list = new ArrayList<>();
        for(int i = 0; i < array.length(); i++){
            String name = array.getJSONObject(i).getString(key);
            list.add(name);
        }
        return list;
    }
}
