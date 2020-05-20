import java.util.ArrayList;

import org.json.*;

public class ProjectArea {
    ServiceAccountManager service = new ServiceAccountManager();

    String url;
    String name;
    String projectUri;
    String lastUpdated;
    ArrayList<Artifact> artifacts;
    ArrayList<Artifact> rowArtifacts;
    ArrayList<Artifact> columnArtifacts;
    ArrayList<Module> modules;
    Boolean linksOnly = false;

    public ProjectArea(String url, String name, String projectUri, String lastUpdated){

        this.url = url;
        this.name = name;
        this.projectUri = projectUri;
        this.lastUpdated = lastUpdated;
        this.artifacts = new ArrayList<>();
        this.rowArtifacts = this.artifacts;
        this.columnArtifacts = this.artifacts;
        this.modules = new ArrayList<>();
    }

    public ProjectArea(String projectUri){
        MongoHelper mongo = MongoHelper.get();
        JSONObject project = mongo.query("ProjectAreaProjectURI", projectUri);
        JSONArray tempArtifacts = project.getJSONArray("artifacts");
        JSONArray tempModules = project.getJSONArray("modules");
        ArrayList<Artifact> artifacts = new ArrayList<>();
        ArrayList<Module> modules =  new ArrayList<>();

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

        for(int i = 0; i < tempModules.length(); i++){
            JSONObject tempModule = tempModules.getJSONObject(i);
            String moduleName =  tempModule.getString("ModuleName");
            String moduleId = tempModule.getString("ModuleID");
            String moduleItemId = tempModule.getString("ModuleItemID");
            String moduleParentFolder = tempModule.getString("ModuleParentFolder");
            String moduleFormat = tempModule.getString("ModuleFormat");
            String moduleType = tempModule.getString("ModuleType");
            String moduleUrl = tempModule.getString("ModuleURL");
            Module newModule = new Module(moduleName, moduleId, moduleItemId, moduleParentFolder, moduleFormat, moduleType, moduleUrl);

            JSONArray moduleArtifacts = tempModule.getJSONArray("artifacts");
            for(int j = 0; j < moduleArtifacts.length(); j++){
                JSONObject tempArtifact = moduleArtifacts.getJSONObject(j);
                String artifactType = tempArtifact.getString("ArtifactType");
                String artifactId = tempArtifact.getString("ArtifactID");
                String artifactItemId = tempArtifact.getString("ArtifactItemID");
                String artifactName = tempArtifact.getString("ArtifactName");
                String artifactParentFolder = tempArtifact.getString("ArtifactParentFolder");
                String artifactModule = moduleName;
                String artifactUrl = tempArtifact.getString("ArtifactURL");
                String artifactFormat = tempArtifact.getString("ArtifactFormat");

                Artifact newArtifact = new Artifact(artifactType, artifactId, artifactItemId, artifactName, artifactParentFolder, artifactModule, artifactUrl, artifactFormat);

                JSONArray moduleLinks = tempArtifact.getJSONArray("links");
                for(int k = 0; k < moduleLinks.length(); k++){
                    JSONObject tempLink = moduleLinks.getJSONObject(k);
                    String linkId = tempLink.getString("LinkID");
                    String linkTitle = tempLink.getString("LinkTitle");
                    String linkDescription = tempLink.getString("LinkDescription");
                    String linkFormat = tempLink.getString("LinkFormat");
                    String linkArtifactFormat = tempLink.getString("LinkArtifactFormat");
                    String linkType = tempLink.getString("LinkType");
                    String linkLinkTitle = tempLink.getString("LinkLinkTitle");

                    Link newLink = new Link(linkId, linkTitle, linkDescription, linkFormat, linkArtifactFormat, linkType, linkLinkTitle);
                    newArtifact.addLink(newLink);
                }
                newModule.addArtifact(newArtifact);
            }
            modules.add(newModule);
        }

        this.projectUri = project.getString("ProjectAreaProjectURI");
        this.url = project.getString("ProjectAreaURL");
        this.name = project.getString("ProjectAreaName");
        this.lastUpdated = project.getString("LastUpdated");
        this.artifacts = artifacts;
        this.rowArtifacts = artifacts;
        this.columnArtifacts = artifacts;
        this.modules = modules;
    }

    public ProjectArea(String projectUri, Payload payload){
        this(projectUri);
        this.filterAll(payload);
    }

    void addArtifact(Artifact artifact){
        this.artifacts.add(artifact);
    }

    void setArtifacts(ArrayList<Artifact> artifacts){
        this.artifacts = new ArrayList<>();
        this.artifacts = artifacts;
    }

    void setModules(ArrayList<Module> modules){
        this.modules = new ArrayList();
        this.modules = modules;
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
            if (parentFolders.contains(a.parentFolder)  && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);

        return filteredArtifacts;
    }

    private ArrayList<Module> filterModules(ArrayList<String> moduleString){
        System.out.println("Module Filter Size: " + moduleString.size());
        ArrayList<Module> filteredModules = new ArrayList<>();

        if(moduleString.size() < 1) return this.modules;

        for(Module a: this.modules)
            if (moduleString.contains(a.name)  && !filteredModules.contains(a)) filteredModules.add(a);

        System.out.println("Filtered Module Size: " + filteredModules.size());
        return filteredModules;
    }

    private ArrayList<Artifact> getModuleArtifacts(ArrayList<Module> tempModules){

        ArrayList<Artifact> artifacts = new ArrayList<>();

        if(tempModules.size() < 1) return artifacts;

        for(Module m: tempModules)
            for(Artifact a: m.artifacts)
                artifacts.add(a);


        return artifacts;
    }

    private ArrayList<Artifact> filterArtifactTypes(ArrayList<String> artifactTypes, ArrayList<Artifact> tempArtifacts){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(artifactTypes.size() < 1) return tempArtifacts;

        for(Artifact a: tempArtifacts) {
           // System.out.println(a.artifactType);
            for(String t: artifactTypes) {
                if(t.equals(a.artifactType)  && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);
            }
        }

        return filteredArtifacts;
    }

    private void filterRowDependencies(ArrayList<String> dependencies){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();
        System.out.println("Dependency Size: " + dependencies.size());
        dependencies.forEach(d -> {
            System.out.println(d);
        });
        ArrayList<String> rowItemIDs =  new ArrayList<>();
        ArrayList<String> rowIDs =  new ArrayList<>();
        for (Artifact row : this.rowArtifacts) {
            rowItemIDs.add(row.itemId);
            rowIDs.add(row.id);
        }

        ArrayList<String> colItemIDs =  new ArrayList<>();
        ArrayList<String> colIDs =  new ArrayList<>();
        for (Artifact col : this.columnArtifacts) {
            colItemIDs.add(col.itemId);
            colIDs.add(col.id);
        }

        if(dependencies.size() < 1) return;
        for(Artifact a: rowArtifacts)
            for(Link l: a.links)
                if (dependencies.contains(getLinkFullName(l.linkType)) && !filteredArtifacts.contains(a)  && (colItemIDs.contains(l.id) || colIDs.contains(l.id))) filteredArtifacts.add(a);

        this.setRowArtifacts(filteredArtifacts);
    }

    private void filterColumnDependencies(ArrayList<String> dependencies){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        ArrayList<String> rowItemIDs =  new ArrayList<>();
        ArrayList<String> rowIDs =  new ArrayList<>();
        for (Artifact row : this.rowArtifacts) {
            rowItemIDs.add(row.itemId);
            rowIDs.add(row.id);
        }

        ArrayList<String> colItemIDs =  new ArrayList<>();
        ArrayList<String> colIDs =  new ArrayList<>();
        for (Artifact col : this.columnArtifacts) {
            colItemIDs.add(col.itemId);
            colIDs.add(col.id);
        }

        if(dependencies.size() < 1) return;
        for(Artifact a: columnArtifacts)
            for(Link l: a.links)
                if (dependencies.contains(getLinkFullName(l.linkType))  && !filteredArtifacts.contains(a) && (rowItemIDs.contains(l.id) || rowIDs.contains(l.id))) filteredArtifacts.add(a);

        this.setColumnArtifacts(filteredArtifacts);
    }

    private void filterAll(Payload payload){
        this.linksOnly = payload.linksOnly;
        if(payload.showModules){
            this.setColumnArtifacts(getModuleArtifacts(filterModules(payload.columns)));
            this.setRowArtifacts(getModuleArtifacts(filterModules(payload.rows)));
        }else{
            this.setColumnArtifacts(filterParentFolders(payload.columns));
            this.setRowArtifacts(filterParentFolders(payload.rows));
        }

        this.setColumnArtifacts(filterArtifactTypes(payload.columnTypes, this.columnArtifacts));
        this.setRowArtifacts(filterArtifactTypes(payload.rowTypes, this.rowArtifacts));

        filterRowDependencies(payload.dependencies);
        filterColumnDependencies(payload.dependencies);

        if(this.linksOnly){
            setColumnArtifacts(getOnlyLinks(this.columnArtifacts, this.rowArtifacts));
            setRowArtifacts(getOnlyLinks(this.rowArtifacts, this.columnArtifacts));
        }
    }

    private JSONArray getArtifactTypes(){
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

    private JSONObject getLinkTypes(){
        JSONObject ret = new JSONObject();
        JSONArray linkTypes = new JSONArray();
        ArrayList<String> uniqueLinks = new ArrayList<>();



        for(Artifact a: this.artifacts){
            for(Link l: a.links){
                if(!uniqueLinks.contains(getLinkFullName(l.linkType))){
                    JSONObject temp = new JSONObject();
                    uniqueLinks.add(getLinkFullName(l.linkType));
                    temp.put("label", getLinkFullName(l.linkType));
                    temp.put("value", getLinkFullName(l.linkType));
                    temp.put("color", getLinkColor(l.linkType));
                    linkTypes.put(temp);
                }
            }
        }
        ret.put("linkTypes", linkTypes);
        ret.put("legend", getLegend(this.columnArtifacts, this.rowArtifacts));
        return ret;
    }

    private JSONArray getParentFolders(){
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

    private JSONObject getModuleNames(){
        JSONObject moduleData = new JSONObject();
        JSONArray moduleNames = new JSONArray();
        JSONArray moduleArtifactTypes = new JSONArray();
        JSONArray moduleLinkTypes = new JSONArray();
        ArrayList<String> uniqueModules = new ArrayList<>();
        ArrayList<String> uniqueArtifactTypes = new ArrayList<>();
        ArrayList<String> uniqueLinkTypes = new ArrayList<>();
        int i = 0;
        for(Module m: this.modules){
            if(!uniqueModules.contains(m.name)){
                uniqueModules.add(m.name);
                JSONObject tempMod = new JSONObject();
                tempMod.put("label", m.name);
                tempMod.put("id", this.getModuleIndex(m.name));
                i++;

                JSONArray tempArts = m.getArtifactTypes();
                for(int j =0; j < tempArts.length(); j++){
                    JSONObject art = tempArts.getJSONObject(j);
                    if(!uniqueArtifactTypes.contains(art.getString("value"))){
                        uniqueArtifactTypes.add(art.getString("value"));
                        moduleArtifactTypes.put(art);
                    }
                }

                JSONArray tempLinks = m.getLinkTypes();
                for(int j =0; j < tempLinks.length(); j++){
                    JSONObject link = tempLinks.getJSONObject(j);
                    if(!uniqueLinkTypes.contains(link.getString("value"))){
                        uniqueLinkTypes.add(link.getString("value"));
                        moduleLinkTypes.put(link);
                    }
                }

                moduleNames.put(tempMod);
            }
        }
        moduleData.put("names", moduleNames);
        moduleData.put("artifactTypes", moduleArtifactTypes);
        moduleData.put("linkTypes", moduleLinkTypes);
        return moduleData;
    }

    private static JSONArray getHeaderOptions(){
        return new JSONArray("[\n" +
                " { \"name\": \"ID\" },\n" +
                " { \"name\": \"Name\"}\n" +
                "]");
    }

    JSONObject getFields(Boolean showModules){
        JSONObject fields = new JSONObject();
       /* if(showModules){
            JSONObject tempModules = getModuleNames();
            fields.put("parentFolders", tempModules.getJSONArray("names"));
            fields.put("artifactTypes", tempModules.getJSONArray("artifactTypes"));
            fields.put("linkTypes", tempModules.getJSONArray("linkTypes"));
        }else{*/
            fields.put("parentFolders", getParentFolders());
            fields.put("artifactTypes", getArtifactTypes());
            fields.put("linkTypes", getLinkTypes().getJSONArray("linkTypes"));
        //}


        fields.put("legend", getLinkTypes().getJSONArray("legend"));

        fields.put("headers", getHeaderOptions());
        fields.put("modules", getModuleNames());

        return fields;
    }

    JSONObject getTableJSON(){

        JSONObject tableData = new JSONObject();
        JSONArray columnHeaderCount = new JSONArray();
        JSONArray columnHeaders = new JSONArray();
        JSONArray rows = new JSONArray();

        //For Empty edge cell
        JSONObject edgeCountCell = getCellObject("","","","","",false,"","","","rowCounter","edgeCountCell");
        columnHeaderCount.put(edgeCountCell);

        //Empty Column Header(first column header - blank)
        JSONObject emptyColumnHeader = getHeaderObject("","","","","", "","","rowCounter");
        columnHeaders.put(emptyColumnHeader);

        //Get all column headers and corresponding count cells
        columnArtifacts.forEach(a -> {
            JSONObject countCell = getCellObject(Integer.toString(a.links.size()), a.name, a.id, "", "", false, "", "", "", "","colCountCell");
            columnHeaderCount.put(countCell);

            JSONObject temp = getHeaderObject(a.name, a.url, a.id, a.artifactType, a.parentFolder, a.module,Integer.toString(a.links.size()), "");
            columnHeaders.put(temp);
        });

        //Empty Row Header(first row header - blank)
        JSONObject emptyRowHeader = getHeaderObject("","","","","", "","","rowCounter");
        emptyRowHeader.put("cells", columnHeaderCount);

        rows.put(emptyRowHeader);

        rowArtifacts.forEach(a -> {
            //Get Row Header
            JSONObject rowHeader = getHeaderObject(a.name, a.url, a.id, a.artifactType, a.parentFolder, a.module, Integer.toString(a.links.size()), "");

            //Count cell to start row
            JSONObject rowCount = getCellObject(Integer.toString(a.links.size()), "", "", "", "", false, "", "", "", "rowCounter", "rowCountCell");
            JSONArray cells = new JSONArray();
            cells.put(rowCount);

            //Get cells for that row
            columnArtifacts.forEach(j -> {
                JSONObject cell;

                String rowLinkType = "";
                String colLinkType = "";

                boolean colAdd = false;
                for(Link l: j.links){
                    if(a.itemId.equals(l.id) || (a.id.equals(l.id) && a.name.equals(l.title))){
                        if(colAdd){
                            colLinkType = colLinkType + " and " + l.linkType;
                        }else{
                            colAdd = true;
                            colLinkType = l.linkType;
                        }
                    }
                }

                boolean rowAdd = false;
                for(Link l: a.links){
                    if(j.itemId.equals(l.id) || (j.id.equals(l.id) && j.name.equals(l.title))){
                        if(rowAdd){
                            rowLinkType = rowLinkType + " and " + l.linkType;
                        }else{
                            rowAdd = true;
                            rowLinkType = l.linkType;
                        }
                    }
                }

                if(rowAdd || colAdd) {
                    if(rowLinkType.contains("and") || colLinkType.contains("and"))
                        cell = getCellObject("+", j.name, j.id, a.name, a.id, true, rowLinkType, colLinkType, getLinkColor(rowLinkType), "", "multi-arrow");
                    else
                        cell = getCellObject("", j.name, j.id, a.name, a.id, true, rowLinkType, colLinkType, getLinkColor(rowLinkType), "", "arrow");
                }
                else
                    cell = getCellObject("", j.name, j.id, "", "", false, rowLinkType, colLinkType, "", "", "normalCell");

                cells.put(cell);
            });
            rowHeader.put("cells",cells);
            rows.put(rowHeader);
        });

        tableData.put("columns", columnHeaders);
        tableData.put("rows", rows);
        tableData.put("projectURI", this.projectUri);
        tableData.put("projectName", this.name);
        return tableData;
    }

    private JSONObject getCellObject(String cellContent, String name, String id, String linkName, String linkId, boolean isLink, String rowLinkType, String colLinkType, String color, String tableElemID, String className){
        JSONObject cell = new JSONObject();

        cell.put("cell", cellContent);
        cell.put("name", name);
        cell.put("id", id);
        cell.put("linkName", linkName);
        cell.put("linkId", linkId);
        cell.put("isLink", isLink);
        cell.put("rowLinkType", rowLinkType);
        cell.put("colLinkType", colLinkType);
        cell.put("color", color);
        cell.put("tableElemID", tableElemID);
        cell.put("className", className);

        return cell;
    }

    private JSONObject getHeaderObject(String name, String url, String id, String type, String parentFolder, String module, String numLinks, String tableElemID){
        JSONObject header = new JSONObject();

        header.put("name", name);
        header.put("url", url);
        header.put("id", id);
        header.put("type", type);
        header.put("parentFolder", parentFolder);
        header.put("module", module);
        header.put("numLinks", numLinks);
        header.put("tableElemID", tableElemID);

        return header;
    }

    JSONObject getTableJSON(JSONObject payload){



        JSONObject formattedPayload = new JSONObject();
        JSONArray JSONRows = new JSONArray();
        JSONArray JSONColumns = new JSONArray();
        JSONArray JSONRowTypes = new JSONArray();
        JSONArray JSONColumnTypes = new JSONArray();
        JSONArray JSONDependencies = new JSONArray();
        if(payload.getBoolean("showModules")){
            JSONColumns =      payload.getJSONObject("module").getJSONArray("columns");
            JSONRows =         payload.getJSONObject("module").getJSONArray("rows");
            JSONRowTypes =     payload.getJSONObject("module").getJSONArray("rowTypes");
            JSONColumnTypes =  payload.getJSONObject("module").getJSONArray("columnTypes");
            JSONDependencies = payload.getJSONObject("module").getJSONArray("linkTypes");

        }else{
            JSONColumns = payload.getJSONArray("columns");
            JSONRows = payload.getJSONArray("rows");
            JSONRowTypes = payload.getJSONArray("rowTypes");
            JSONColumnTypes = payload.getJSONArray("columnTypes");
            JSONDependencies = payload.getJSONArray("dependencies");
        }
        JSONArray columns = new JSONArray();
        for(int i = 0; i < JSONColumns.length(); i++){
            JSONObject tempColumn = new JSONObject();
            String tempName = JSONColumns.getJSONObject(i).getString("name");
            tempColumn.put("label", tempName);
            if(payload.getBoolean("showModules")){
                tempColumn.put("id", "col" + this.getModuleIndex(tempName));
            }else{
                tempColumn.put("id", "col" + this.getParentFolderIndex(tempName));
            }


            columns.put(tempColumn);
        }

        formattedPayload.put("columns", columns);

        JSONArray rows = new JSONArray();
        for(int i = 0; i < JSONRows.length(); i++){
            JSONObject tempRow = new JSONObject();
            String tempName = JSONRows.getJSONObject(i).getString("name");
            tempRow.put("label", tempName);

            if(payload.getBoolean("showModules")){
                tempRow.put("id", "row" + this.getModuleIndex(tempName));
            }else{
                tempRow.put("id", "row" + this.getParentFolderIndex(tempName));
            }

            rows.put(tempRow);
        }

        formattedPayload.put("rows", rows);

        JSONArray rowTypes = new JSONArray();
        for(int i = 0; i < JSONRowTypes.length(); i++){
            JSONObject tempRow = new JSONObject();
            String tempName = JSONRowTypes.getJSONObject(i).getString("name");
            tempRow.put("label", tempName);
            tempRow.put("value", tempName);

            rowTypes.put(tempRow);
        }

        formattedPayload.put("rowTypes", rowTypes);

        JSONArray columnTypes = new JSONArray();
        for(int i = 0; i < JSONColumnTypes.length(); i++){
            JSONObject tempColumnType = new JSONObject();
            String tempName = JSONColumnTypes.getJSONObject(i).getString("name");
            tempColumnType.put("label", tempName);
            tempColumnType.put("value", tempName);

            columnTypes.put(tempColumnType);
        }

        formattedPayload.put("columnTypes", columnTypes);

        JSONArray dependencies = new JSONArray();
        for(int i = 0; i < JSONDependencies.length(); i++){
            JSONObject tempDependencies = new JSONObject();
            String tempName = JSONDependencies.getJSONObject(i).getString("name");
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

    private int getModuleIndex(String name){

        ArrayList<String> uniqueModules = new ArrayList<>();
        for(Module m: this.modules){
            if(!uniqueModules.contains(m.name)){
                uniqueModules.add(m.name);
            }
        }

        for(int i = 0; i < uniqueModules.size(); i++){
            if(uniqueModules.get(i).equals(name)){

                return i + 1;
            }
        }
        return 0;
    }

    private ArrayList<Artifact> getOnlyLinks(ArrayList<Artifact> baseList, ArrayList<Artifact> compareList){
        ArrayList<Artifact> artifacts = new ArrayList<>();
        for(Artifact r: baseList){
            boolean add = false;
            for(Link l: r.links){
                for(Artifact c: compareList){
                    if(c.itemId.equals(l.id) || (c.id.equals(l.id) && c.name.equals(l.title))){
                        add = true;
                    }
                }
            }
            if(add)
                artifacts.add(r);
        }

        return artifacts;
    }

    private JSONArray getLegend(ArrayList<Artifact> baseList, ArrayList<Artifact> compareList){
        ArrayList<String> uniqueFullLinks = new ArrayList<>();

        ArrayList<String> rowItemIDs =  new ArrayList<>();
        ArrayList<String> rowIDs =  new ArrayList<>();
        for (Artifact row : this.rowArtifacts) {
            rowItemIDs.add(row.itemId);
            rowIDs.add(row.id);
        }

        ArrayList<String> colItemIDs =  new ArrayList<>();
        ArrayList<String> colIDs =  new ArrayList<>();
        for (Artifact col : this.columnArtifacts) {
            colItemIDs.add(col.itemId);
            colIDs.add(col.id);
        }

        JSONArray legend = new JSONArray();
        for(Artifact r: baseList){

            for(Link l: r.links){
                for(Artifact c: compareList){
                    if(c.itemId.equals(l.id) || (c.id.equals(l.id) && c.name.equals(l.title))){
                        if(!uniqueFullLinks.contains(getLinkFullName(l.linkType)) && ((rowItemIDs.contains(l.id) || rowIDs.contains(l.id)) || (colItemIDs.contains(l.id) || colIDs.contains(l.id)))) {
                            JSONObject temp = new JSONObject();
                            uniqueFullLinks.add(getLinkFullName(l.linkType));
                            temp.put("name", getLinkFullName(l.linkType));
                            temp.put("color", getLinkColor(l.linkType));
                            legend.put(temp);
                        }
                    }
                }
            }

        }

        return legend;
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
        else if(linkType.toLowerCase().contains("satisfie") && !linkType.toLowerCase().contains("architecture"))
            return "blue";
        else if(linkType.toLowerCase().contains("satisfie") && linkType.toLowerCase().contains("architecture"))
            return "orange";
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

    private String getLinkFullName(String linkType){
        if(linkType.toLowerCase().contains("affect"))
            return "Affects/Affected By";
        else if(linkType.toLowerCase().contains("term"))
            return "References Term/Term Referenced From";
        else if(linkType.toLowerCase().contains("constrain"))
            return "Constrains/Constrained By";
        else if(linkType.toLowerCase().contains("parent") || linkType.toLowerCase().contains("child"))
            return "Parent Of/Child Of";
        else if(linkType.toLowerCase().contains("derive"))
            return "Derives Architecture Element/Derives From Architecture Element";
        else if(linkType.toLowerCase().contains("embed"))
            return "Embeds/Embedded In";
        else if(linkType.toLowerCase().contains("extract"))
            return "Extracted/Extracted From";
        else if(linkType.toLowerCase().contains("illustrate"))
            return "Illustrates/Illustrated By";
        else if(linkType.toLowerCase().contains("implement"))
            return "Implements/Implemented By";
        else if(linkType.toLowerCase().contains("link"))
            return "Link (To/From)";
        else if(linkType.toLowerCase().contains("mitigate"))
            return "Mitigates";
        else if(linkType.toLowerCase().contains("reference"))
            return "References/Referenced By";
        else if(linkType.toLowerCase().contains("refine"))
            return "Refines Architecture Element/Refined By Architecture Element";
        else if((linkType.toLowerCase().contains("satisfie")) && !linkType.toLowerCase().contains("architecture"))
            return "Satisfies/Satisfied By";
        else if(linkType.toLowerCase().contains("satisfie") && linkType.toLowerCase().contains("architecture"))
            return "Satisfies Architecture Element / Satisfied By Architecture Element";
        else if(linkType.toLowerCase().contains("synonym"))
            return "Synonym";
        else if(linkType.toLowerCase().contains("trace"))
            return "Trace Architecture Element/Traced By Architecture Element";
        else if(linkType.toLowerCase().contains("track"))
            return "Tracks/Tracked By";
        else if(linkType.toLowerCase().contains("validate"))
            return "Validates/Validated By";
        else
            return "Unknown Link Type";
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

        JSONArray modulesArray = new JSONArray();
        this.modules.forEach(m -> {
            JSONObject moduleObj = new JSONObject();
            moduleObj.put("ModuleName", m.name);
            moduleObj.put("ModuleID", m.id);
            moduleObj.put("ModuleItemID", m.itemId);
            moduleObj.put("ModuleParentFolder", m.parentFolder);
            moduleObj.put("ModuleFormat", m.format);
            moduleObj.put("ModuleType", m.type);
            moduleObj.put("ModuleURL", m.url);

            JSONArray moduleArtifactsArray = new JSONArray();
            m.artifacts.forEach(ma -> {
                JSONObject moduleArtifact = new JSONObject();

                moduleArtifact.put("ArtifactType", ma.artifactType);
                moduleArtifact.put("ArtifactID", ma.id);
                moduleArtifact.put("ArtifactItemID", ma.itemId);
                moduleArtifact.put("ArtifactName", ma.name);
                moduleArtifact.put("ArtifactParentFolder", ma.parentFolder);
                moduleArtifact.put("ArtifactModule", ma.module);
                moduleArtifact.put("ArtifactURL", ma.url);
                moduleArtifact.put("ArtifactFormat", ma.format);

                JSONArray linkArray = new JSONArray();
                ma.links.forEach(l -> {
                    JSONObject moduleLinkObj = new JSONObject();

                    moduleLinkObj.put("LinkID", l.id);
                    moduleLinkObj.put("LinkTitle", l.title);
                    moduleLinkObj.put("LinkDescription", l.description);
                    moduleLinkObj.put("LinkFormat", l.format);
                    moduleLinkObj.put("LinkArtifactFormat", l.artifactFormat);
                    moduleLinkObj.put("LinkType", l.type);
                    moduleLinkObj.put("LinkLinkTitle", l.linkTitle);

                    linkArray.put(moduleLinkObj);
                });
                
                moduleArtifact.put("links", linkArray);
                moduleArtifactsArray.put(moduleArtifact);
            });

            moduleObj.put("artifacts", moduleArtifactsArray);
            modulesArray.put(moduleObj);
        });

        project.put("modules", modulesArray);

        return project;
    }
}
