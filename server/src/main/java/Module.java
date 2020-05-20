import java.util.ArrayList;
import org.json.*;

public class Module {
    String name;
    String id;
    String itemId;
    String parentFolder;
    String format;
    String type;
    String url;
    ArrayList<Artifact> artifacts;

    public Module(String name, String id, String itemId, String parentFolder, String format, String type, String url){
        this.name = name;
        this.id = id;
        this.itemId = itemId;
        this.parentFolder = parentFolder;
        this.format = format;
        this.type = type;
        this.url = url;
        this.artifacts = new ArrayList<>();
    }

    void addArtifact(Artifact artifact){
        this.artifacts.add(artifact);
    }

    void setArtifacts(ArrayList<Artifact> artifacts){
        this.artifacts = new ArrayList<>();
        this.artifacts = artifacts;
    }

    public ArrayList<Artifact> filterArtifactTypes(ArrayList<String> artifactTypes){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(artifactTypes.size() < 1) return this.artifacts;

        for(Artifact a: this.artifacts) {
            // System.out.println(a.artifactType);
            for(String t: artifactTypes) {
                if(t.equals(a.artifactType)  && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);
            }
        }

        return filteredArtifacts;
    }

    public ArrayList<Artifact> filterDependencies(ArrayList<String> dependencies){
        ArrayList<Artifact> filteredArtifacts = new ArrayList<>();

        if(dependencies.size() < 1) return this.artifacts;
        for(Artifact a: this.artifacts)
            for(Link l: a.links)
                if (dependencies.contains(getLinkFullName(l.type)) && !filteredArtifacts.contains(a)) filteredArtifacts.add(a);

        return filteredArtifacts;
    }

    public void filterAll(ArrayList<String> moduleLinkTypes, ArrayList<String> moduleDependencies){
        this.setArtifacts(filterArtifactTypes(moduleLinkTypes));
        this.setArtifacts(filterDependencies(moduleDependencies));
    }

    public JSONArray getArtifactTypes(){
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

    public JSONArray getLinkTypes(){
        JSONArray linkTypes = new JSONArray();
        ArrayList<String> uniqueLinks = new ArrayList<>();

        for(Artifact a: this.artifacts){
            for(Link l: a.links){
                if(!uniqueLinks.contains(getLinkFullName(l.linkTitle))){
                    JSONObject temp = new JSONObject();
                    uniqueLinks.add(getLinkFullName(l.linkTitle));
                    temp.put("label", getLinkFullName(l.linkTitle));
                    temp.put("value", getLinkFullName(l.linkTitle));
                    temp.put("color", getLinkColor(l.linkTitle));
                    linkTypes.put(temp);
                }
            }
        }

        return linkTypes;
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
        else if(linkType.toLowerCase().contains("satisfie") && !linkType.toLowerCase().contains("architecture"))
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


    // Overriding equals() to compare two Complex objects
    @Override
    public boolean equals(Object o) {

        // If the object is compared with itself then return true
        if (o == this) {
            return true;
        }

        /* Check if o is an instance of Complex or not
          "null instanceof [type]" also returns false */
        if (!(o instanceof Module)) {
            return false;
        }

        // typecast o to Complex so that we can compare data members
        Module c = (Module) o;

        // Compare the data members and return accordingly
        return ((c.type.equals(this.type)) && (c.id.equals(this.id)) && (c.name.equals(this.name)) && (c.url.equals(this.url)) && (c.url.equals(this.url)) && (c.parentFolder.equals(this.parentFolder)));
    }
}
