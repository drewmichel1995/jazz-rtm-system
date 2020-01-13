import java.util.ArrayList;
import org.json.*;

public class ProjectArea {
    String url;
    String name;
    String projectUri;
    String lastUpdated;
    ArrayList<Artifact> artifacts;
    ArrayList<Artifact> rowArtifacts;
    ArrayList<Artifact> columnArtifacts;
    Boolean linksOnly = false;

    public ProjectArea(String url, String name, String projectUri, String lastUpdated){
        this.url = url;
        this.name = name;
        this.projectUri = projectUri;
        this.lastUpdated = lastUpdated;
        this.artifacts = new ArrayList<>();
        this.rowArtifacts = this.artifacts;
        this.columnArtifacts = this.artifacts;
    }

    public ProjectArea(String projectUri){
        MongoHelper mongo = MongoHelper.get();
        JSONObject project = mongo.query("ProjectAreaProjectURI", projectUri);
        JSONArray tempArtifacts = project.getJSONArray("artifacts");
        ArrayList<Artifact> artifacts = new ArrayList<>();

        for(int i = 0; i < tempArtifacts.length(); i++){
            JSONObject temp = tempArtifacts.getJSONObject(i);
            JSONArray links = temp.getJSONArray("links");
            Artifact tempArtifact = new Artifact(temp.getString("ArtifactType"), temp.getString("ArtifactID"), temp.getString("ArtifactItemID"), temp.getString("ArtifactName"), temp.getString("ArtifactParentFolder"), temp.getString("ArtifactURL"));
            for(int j = 0; j < links.length(); j++){
                JSONObject tempLink = links.getJSONObject(j);
                boolean isParentLink = tempLink.getBoolean("LinkIsParentLink");
                boolean isChildLink = tempLink.getBoolean("LinkIsChildLink");
                String linkCategory = tempLink.getString("LinkCategory");
                String linkType = tempLink.getString("LinkType");
                String linkId = tempLink.getString("LinkID");
                tempArtifact.addLink(new Link(linkId, linkType, linkCategory, isChildLink, isParentLink));
            }

            artifacts.add(tempArtifact);
        }

        this.projectUri = project.getString("ProjectAreaProjectURI");
        this.url = project.getString("ProjectAreaURL");
        this.name = project.getString("ProjectAreaName");
        this.lastUpdated = project.getString("LastUpdated");
        this.artifacts = artifacts;
        this.rowArtifacts = artifacts;
        this.columnArtifacts = artifacts;
    }

    public ProjectArea(String projectUri, Payload payload){
        this(projectUri);
        this.filterAll(payload.columns, payload.rows, payload.columnTypes, payload.rowTypes, payload.dependencies);
        this.linksOnly = payload.linksOnly;

        if(this.linksOnly){
            setColumnArtifacts(getOnlyLinks(this.columnArtifacts, this.rowArtifacts));
            setRowArtifacts(getOnlyLinks(this.rowArtifacts, this.columnArtifacts));
        }
    }

    void addArtifact(Artifact artifact){
        this.artifacts.add(artifact);
    }

    ArrayList<Artifact> getArtifacts(JSONArray jsonArtifacts){
        ArrayList<Artifact> artifacts = new ArrayList<>();
        for(int i = 0; i < jsonArtifacts.length(); i++){
            String temp = jsonArtifacts.getString(i);
            for(Artifact a: this.artifacts)
                if(a.itemId.equals(temp))
                    artifacts.add(a);
        }

        return artifacts;
    }

    void setArtifacts(ArrayList<Artifact> artifacts){
        this.artifacts = new ArrayList<>();
        this.artifacts = artifacts;
    }

    private void setRowArtifacts(ArrayList<Artifact> tempArtifacts){
        this.rowArtifacts = new ArrayList<>();
        this.rowArtifacts = tempArtifacts;
    }

    private void setColumnArtifacts(ArrayList<Artifact> tempArtifacts){
        this.columnArtifacts = new ArrayList<>();
        this.columnArtifacts = tempArtifacts;
    }

    private ArrayList<Artifact> filterParentFolders(ArrayList<String> parentFolders){

        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(parentFolders.size() < 1) return this.artifacts;

        for(Artifact a: artifacts)
            if (parentFolders.contains(a.parentFolder)) filteredArtifacts.add(a);

        return filteredArtifacts;
    }

    private ArrayList<Artifact> filterArtifactTypes(ArrayList<String> artifactTypes, ArrayList<Artifact> tempArtifacts){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(artifactTypes.size() < 1) return tempArtifacts;

        for(Artifact a: tempArtifacts)
            if (artifactTypes.contains(a.artifactType)) filteredArtifacts.add(a);

        return filteredArtifacts;
    }

    private void filterRowDependencies(ArrayList<String> dependencies){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(dependencies.size() < 1) return;
        for(Artifact a: rowArtifacts)
            for(Link l: a.links)
                if (dependencies.contains(l.linkType) && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);

        this.setRowArtifacts(filteredArtifacts);
    }

    private void filterColumnDependencies(ArrayList<String> dependencies){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(dependencies.size() < 1) return;
        for(Artifact a: columnArtifacts)
            for(Link l: a.links)
                if (dependencies.contains(l.linkType) && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);

        this.setColumnArtifacts(filteredArtifacts);
    }

    void filterAll(ArrayList<String> columns, ArrayList<String> rows, ArrayList<String> columnArtifactTypes, ArrayList<String> rowArtifactTypes, ArrayList<String> dependencies){

        this.setColumnArtifacts(filterParentFolders(columns));
        this.setRowArtifacts(filterParentFolders(rows));
        this.setColumnArtifacts(filterArtifactTypes(columnArtifactTypes, this.columnArtifacts));
        this.setRowArtifacts(filterArtifactTypes(rowArtifactTypes, this.rowArtifacts));

        filterRowDependencies(dependencies);
        filterColumnDependencies(dependencies);

    }

    JSONArray getArtifactTypes(){
        JSONArray artifactTypes = new JSONArray();
        ArrayList<String> uniqueTypes = new ArrayList<>();
        for(Artifact a: this.artifacts){
            if(!uniqueTypes.contains(a.artifactType)){
                JSONObject temp = new JSONObject();
                uniqueTypes.add(a.artifactType);

                temp.put("label", a.artifactType);
                temp.put("value", a.artifactType);
                artifactTypes.put(temp);
            }
        }

        return artifactTypes;
    }

    JSONArray getLinkTypes(){
        JSONArray linkTypes = new JSONArray();
        ArrayList<String> uniqueLinks = new ArrayList<>();
        for(Artifact a: this.artifacts){
            for(Link l: a.links){
                if(!uniqueLinks.contains(l.linkType)){
                    JSONObject temp = new JSONObject();
                    uniqueLinks.add(l.linkType);
                    temp.put("label", l.linkType);
                    temp.put("value", l.linkType);
                    temp.put("color", getLinkColor(l.linkType));
                    linkTypes.put(temp);
                }
            }

        }

        return linkTypes;
    }

    JSONArray getParentFolders(){
        JSONArray parentFolders = new JSONArray();
        ArrayList<String> uniqueParents = new ArrayList<>();
        int i = 0;
        for(Artifact a: this.artifacts){
            if(!uniqueParents.contains(a.parentFolder)){
                i++;
                JSONObject temp = new JSONObject();
                uniqueParents.add(a.parentFolder);
                temp.put("id", i);
                temp.put("label", a.parentFolder);
                parentFolders.put(temp);
            }
        }

        return parentFolders;
    }

    private static JSONArray getHeaderOptions(){
        return new JSONArray("[\n" +
                " { \"name\": \"ID\" },\n" +
                " { \"name\": \"Name\"}\n" +
                "]");
    }

    JSONObject getFields(){
        JSONObject fields = new JSONObject();
        fields.put("parentFolders", getParentFolders());
        fields.put("linkTypes", getLinkTypes());
        fields.put("artifactTypes", getArtifactTypes());
        fields.put("headers", getHeaderOptions());

        return fields;
    }

    JSONObject getTableJSON_react_data_grid(){
        JSONObject tableData = new JSONObject();
        JSONArray columnHeaders = new JSONArray();
        JSONArray rows = new JSONArray();
        JSONObject first = new JSONObject();
        int i = 0;
        first.put("name", "");
        first.put("key", "name");
        first.put("id", "");
        columnHeaders.put(first);
        for(Artifact a: artifacts){
            i++;
            JSONObject temp = new JSONObject();
            temp.put("name", a.name);
            temp.put("url", a.url);
            temp.put("id", a.id);
            temp.put("key", Integer.toString(i));
            temp.put("className", "rotate");
            temp.put("width", "20");
            temp.put("ellipsis", true);
            columnHeaders.put(temp);
        }

        for(Artifact a: artifacts){
            JSONObject temp = new JSONObject();
            temp.put("name", a.name);
            temp.put("url", a.url);
            temp.put("id", a.id);
            i = 0;
            for(Artifact j: artifacts){
                i++;
                boolean add = false;
                for(Link l: j.links){
                    if(a.itemId.equals(l.id)){
                        add = true;
                    }
                }

                if(add)
                    temp.put(Integer.toString(i), "1");
                else
                    temp.put(Integer.toString(i), "");
            }

            rows.put(temp);
        }

        tableData.put("columns", columnHeaders);
        tableData.put("rows", rows);
        return tableData;
    }

    JSONObject getTableJSON(){

        if(this.linksOnly){

            System.out.println("Column Artifact Size: " + this.columnArtifacts.size());
            System.out.println("Row Artifact Size: " + this.rowArtifacts.size());

            setColumnArtifacts(getOnlyLinks(this.columnArtifacts, this.rowArtifacts));
            setRowArtifacts(getOnlyLinks(this.rowArtifacts, this.columnArtifacts));

            System.out.println("Column Artifact Size: " + this.columnArtifacts.size());
            System.out.println("Row Artifact Size: " + this.rowArtifacts.size());
        }

        JSONObject tableData = new JSONObject();
        JSONArray columnHeaderCount = new JSONArray();
        JSONArray columnHeaders = new JSONArray();
        JSONArray rows = new JSONArray();

        //For Empty edge cell
        JSONObject tempCount = new JSONObject();
        tempCount.put("cell", "");
        tempCount.put("name", "");
        tempCount.put("id", "");
        tempCount.put("linkName", "");
        tempCount.put("linkId", "");
        tempCount.put("isLink", false);
        tempCount.put("rowLinkType", "");
        tempCount.put("colLinkType", "");
        tempCount.put("color", "");
        tempCount.put("tableElemID", "rowCounter");
        tempCount.put("className", "edgeCountCell");
        columnHeaderCount.put(tempCount);

        tempCount = new JSONObject();
        tempCount.put("name", "");
        tempCount.put("url", "");
        tempCount.put("id", "");
        tempCount.put("linkName", "");
        tempCount.put("linkId", "");
        tempCount.put("isLink", false);
        tempCount.put("rowLinkType", "");
        tempCount.put("colLinkType", "");
        tempCount.put("color", "");
        tempCount.put("tableElemID", "rowCounter");
        columnHeaders.put(tempCount);

        columnArtifacts.forEach(a -> {
            JSONObject countCell = new JSONObject();
            countCell.put("cell", Integer.toString(a.links.size()));
            countCell.put("name", a.name);
            countCell.put("id", a.id);
            countCell.put("linkName", "");
            countCell.put("linkId", "");
            countCell.put("isLink", false);
            countCell.put("rowLinkType", "");
            countCell.put("colLinkType", "");
            countCell.put("tableElemID", "");
            countCell.put("className", "colCountCell");
            columnHeaderCount.put(countCell);

            JSONObject temp = new JSONObject();
            temp.put("name", a.name);
            temp.put("url", a.url);
            temp.put("id", a.id);
            temp.put("type", a.artifactType);
            temp.put("parentFolder", a.parentFolder);
            temp.put("numLinks", a.links.size());
            temp.put("tableElemID", "");
            columnHeaders.put(temp);
        });

        tempCount = new JSONObject();
        tempCount.put("name", "");
        tempCount.put("url", "");
        tempCount.put("id", "");
        tempCount.put("linkName", "");
        tempCount.put("linkId", "");
        tempCount.put("isLink", false);
        tempCount.put("rowLinkType", "");
        tempCount.put("colLinkType", "");
        tempCount.put("tableElemID", "rowCounter");
        tempCount.put("cells", columnHeaderCount);
        rows.put(tempCount);

        rowArtifacts.forEach(a -> {
            JSONObject temp = new JSONObject();
            JSONObject rowCount = new JSONObject();
            rowCount.put("cell", Integer.toString(a.links.size()));
            rowCount.put("name", "");
            rowCount.put("id", "");
            rowCount.put("linkName", "");
            rowCount.put("linkId", "");
            rowCount.put("isLink", false);
            rowCount.put("rowLinkType", "");
            rowCount.put("colLinkType", "");
            rowCount.put("color", "");
            rowCount.put("tableElemID", "rowCounter");
            rowCount.put("className", "rowCountCell");


            temp.put("name", a.name);
            temp.put("url", a.url);
            temp.put("id", a.id);
            temp.put("type", a.artifactType);
            temp.put("parentFolder", a.parentFolder);
            temp.put("numLinks", a.links.size());
            temp.put("tableElemID", "");
            JSONArray cells = new JSONArray();
            cells.put(rowCount);

            columnArtifacts.forEach(j -> {
                JSONObject cell = new JSONObject();
                boolean add = false;
                String rowLinkType = "";
                String colLinkType = "";

                for(Link l: j.links){
                    if(a.itemId.equals(l.id)){
                        add = true;
                       colLinkType = l.linkType;
                    }
                }

                for(Link l: a.links){
                    if(j.itemId.equals(l.id)){
                        add = true;
                        rowLinkType = l.linkType;
                    }
                }

                if(add){
                    cell.put("cell", "");
                    cell.put("name", j.name);
                    cell.put("id", j.id);
                    cell.put("linkName", a.name);
                    cell.put("linkId", a.id);
                    cell.put("isLink", true);
                    cell.put("rowLinkType", rowLinkType);
                    cell.put("colLinkType", colLinkType);
                    cell.put("color", getLinkColor(rowLinkType));
                    cell.put("tableElemID", "");
                    cell.put("className", "arrow normalCell");
                }
                else{
                    cell.put("cell", "");
                    cell.put("name", j.name);
                    cell.put("id", j.id);
                    cell.put("linkName", "");
                    cell.put("linkId", "");
                    cell.put("isLink", false);
                    cell.put("rowLinkType", rowLinkType);
                    cell.put("colLinkType", colLinkType);
                    cell.put("color", "");
                    cell.put("tableElemID", "");
                    cell.put("className", "normalCell");
                }
                cells.put(cell);
            });
            temp.put("cells",cells);
            rows.put(temp);
        });

        tableData.put("columns", columnHeaders);
        tableData.put("rows", rows);
        tableData.put("projectURI", this.projectUri);
        tableData.put("projectName", this.name);
        return tableData;
    }

    JSONObject getTableJSON(JSONObject payload){



        JSONObject formattedPayload = new JSONObject();

        JSONArray columns = new JSONArray();
        for(int i = 0; i < payload.getJSONArray("columns").length(); i++){
            JSONObject tempColumn = new JSONObject();
            String tempName = payload.getJSONArray("columns").getJSONObject(i).getString("name");
            tempColumn.put("label", tempName);
            tempColumn.put("id", this.getParentFolderIndex(tempName));

            columns.put(tempColumn);
        }

        formattedPayload.put("columns", columns);

        JSONArray rows = new JSONArray();
        for(int i = 0; i < payload.getJSONArray("rows").length(); i++){
            JSONObject tempRow = new JSONObject();
            String tempName = payload.getJSONArray("rows").getJSONObject(i).getString("name");
            tempRow.put("label", tempName);
            tempRow.put("id", this.getParentFolderIndex(tempName));

            rows.put(tempRow);
        }

        formattedPayload.put("rows", rows);

        JSONArray rowTypes = new JSONArray();
        for(int i = 0; i < payload.getJSONArray("rowTypes").length(); i++){
            JSONObject tempRow = new JSONObject();
            String tempName = payload.getJSONArray("rowTypes").getJSONObject(i).getString("name");
            tempRow.put("label", tempName);
            tempRow.put("value", tempName);

            rowTypes.put(tempRow);
        }

        formattedPayload.put("rowTypes", rowTypes);

        JSONArray columnTypes = new JSONArray();
        for(int i = 0; i < payload.getJSONArray("columnTypes").length(); i++){
            JSONObject tempColumnType = new JSONObject();
            String tempName = payload.getJSONArray("columnTypes").getJSONObject(i).getString("name");
            tempColumnType.put("label", tempName);
            tempColumnType.put("value", tempName);

            columnTypes.put(tempColumnType);
        }

        formattedPayload.put("columnTypes", columnTypes);

        JSONArray dependencies = new JSONArray();
        for(int i = 0; i < payload.getJSONArray("dependencies").length(); i++){
            JSONObject tempDependencies = new JSONObject();
            String tempName = payload.getJSONArray("dependencies").getJSONObject(i).getString("name");
            tempDependencies.put("label", tempName);
            tempDependencies.put("value", tempName);

            dependencies.put(tempDependencies);
        }

        formattedPayload.put("dependencies", dependencies);

        formattedPayload.put("linksOnly", payload.getBoolean("linksOnly"));

        JSONObject tableData = getTableJSON();

        tableData.put("payload", payload);

        tableData.put("formattedPayload", formattedPayload);

        return tableData;
    }

    private int getParentFolderIndex(String name){

        ArrayList<String> uniqueParents = new ArrayList<>();
        for(Artifact a: this.artifacts){
            if(!uniqueParents.contains(a.parentFolder)){
                uniqueParents.add(a.parentFolder);
            }
        }

        for(int i = 0; i < uniqueParents.size(); i++){
            if(uniqueParents.get(i).equals(name)){

                return i + 1;
            }
        }
        return 0;
    }

    JSONObject getTableJSON(ArrayList<Artifact> filterRows){
        ArrayList<Artifact> columns = new ArrayList<>();
        JSONObject tableData = new JSONObject();
        JSONArray columnHeaders = new JSONArray();
        JSONArray rows = new JSONArray();

        for(Artifact a: artifacts) {

            boolean add = false;
            for(Link l: a.links){
                for(Artifact r: filterRows){
                    if(r.itemId.equals(l.id)){
                        add = true;
                    }
                }
            }

            if(add){
                JSONObject temp = new JSONObject();
                temp.put("name", a.name);
                temp.put("url", a.url);
                temp.put("id", a.id);
                columns.add(a);
                columnHeaders.put(temp);
            }
        }

        filterRows.forEach(a -> {
            JSONObject temp = new JSONObject();
            temp.put("name", a.name);
            temp.put("url", a.url);
            temp.put("id", a.id);
            JSONArray cells = new JSONArray();
            columns.forEach(j -> {
                JSONObject cell = new JSONObject();
                boolean add = false;
                for(Link l: j.links){
                    if(a.itemId.equals(l.id)){
                        add = true;
                    }
                }

                cell.put("cell", "");
                if(add){
                    cell.put("name", j.name);
                    cell.put("id", j.id);
                    cell.put("className", "arrow normalCell");
                }else{
                    cell.put("name", j.name);
                    cell.put("id", j.id);
                    cell.put("className", "normalCell");
                }
                cells.put(cell);
            });
            temp.put("cells",cells);
            rows.put(temp);
        });

        tableData.put("columns", columnHeaders);
        tableData.put("rows", rows);
        return tableData;
    }

    private ArrayList<Artifact> getOnlyLinks(ArrayList<Artifact> baseList, ArrayList<Artifact> compareList){
        ArrayList<Artifact> artifacts = new ArrayList<>();
        int count = 0;
        for(Artifact r: baseList){
            if(r.name.equals("Shock"))
                count++;
            boolean add = false;
            for(Link l: r.links){
                for(Artifact c: compareList){
                    if(c.itemId.equals(l.id)){
                        add = true;
                    }
                }
            }
            if(add)
                artifacts.add(r);
        }

        return artifacts;
    }

    private String getLinkColor(String linkType){
        if(linkType.toLowerCase().contains("affect"))
            return "cadetblue";
        else if(linkType.toLowerCase().contains("term"))
            return "crimson";
        else if(linkType.toLowerCase().contains("constrain"))
            return "darkgreen";
        else if(linkType.toLowerCase().contains("parent") || linkType.toLowerCase().contains("child"))
            return "deepskyblue";
        else if(linkType.toLowerCase().contains("derive"))
            return "indianred";
        else if(linkType.toLowerCase().contains("embed"))
            return "green";
        else if(linkType.toLowerCase().contains("extract"))
            return "navy";
        else if(linkType.toLowerCase().contains("illustrate"))
            return "maroon";
        else if(linkType.toLowerCase().contains("implement"))
            return "mediumseagreen";
        else if(linkType.toLowerCase().contains("link"))
            return "red";
        else if(linkType.toLowerCase().contains("mitigate"))
            return "midnightblue";
        else if(linkType.toLowerCase().contains("reference"))
            return "olive";
        else if(linkType.toLowerCase().contains("refine"))
            return "orangered";
        else if(linkType.toLowerCase().equals("satisfies") || linkType.toLowerCase().equals("satisfied by"))
            return "blue";
        else if(linkType.toLowerCase().contains("synonym"))
            return "rosybrown";
        else if(linkType.toLowerCase().contains("trace"))
            return "purple";
        else if(linkType.toLowerCase().contains("track"))
            return "tomato";
        else if(linkType.toLowerCase().contains("validate"))
            return "teal";
        else
            return "brown";
    }

    JSONObject toJSON(){
        JSONObject project = new JSONObject();
        project.put("ProjectAreaName", this.name);
        project.put("ProjectAreaProjectURI", this.projectUri);
        project.put("ProjectAreaURL", this.url);
        project.put("LastUpdated", this.lastUpdated);

        JSONArray artifactArray = new JSONArray();
        this.artifacts.forEach(a -> {
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

        return project;
    }
}
