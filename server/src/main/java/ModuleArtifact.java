import java.util.ArrayList;

public class ModuleArtifact {
    String artifactType;
    String id;
    String itemId;
    String name;
    String parentFolder;
    String module;
    String url;
    String format;
    ArrayList<ModuleLink> links;
    //Boolean links;

    public ModuleArtifact(String artifactType, String id, String itemId, String name, String parentFolder, String module , String url, String format){
        this.artifactType = artifactType;
        this.id = id;
        this.itemId = itemId;
        this.name = name;
        this.module = module;
        this.parentFolder = parentFolder;
        this.url = url;
        this.format = format;
        this.links = new ArrayList<>();
    }

    void addLink(ModuleLink link){
        this.links.add(link);
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
        if (!(o instanceof ModuleArtifact)) {
            return false;
        }

        // typecast o to Complex so that we can compare data members
        ModuleArtifact c = (ModuleArtifact) o;

        // Compare the data members and return accordingly
        return ((c.artifactType.equals(this.artifactType)) && (c.itemId.equals(this.itemId)) && (c.id.equals(this.id)) && (c.name.equals(this.name)) && (c.url.equals(this.url)) && (c.parentFolder.equals(this.parentFolder)));
    }
}
