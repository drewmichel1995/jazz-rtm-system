import java.util.ArrayList;

public class Artifact {
    String artifactType;
    String id;
    String itemId;
    String name;
    String parentFolder;
    String url;
    ArrayList<Link> links;

    public Artifact(String artifactType, String id, String itemId, String name, String parentFolder, String url){
        this.artifactType = artifactType;
        this.id = id;
        this.itemId = itemId;
        this.name = name;
        this.parentFolder = parentFolder;
        this.url = url;
        this.links = new ArrayList<>();
    }

    void addLink(Link link){
        this.links.add(link);
    }
}
