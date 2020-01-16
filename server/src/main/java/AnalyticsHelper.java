import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;

public class AnalyticsHelper {

    static ProjectArea project;

    public AnalyticsHelper(String projectURI){
        project = new ProjectArea(projectURI);
    }

    private static ArrayList<String> getParentFolders(){
        ArrayList<String> parentFolders = new ArrayList<>();
        project.artifacts.forEach(a -> {
            if(!parentFolders.contains(a.parentFolder))
                parentFolders.add(a.parentFolder);
        });

        return parentFolders;
    }

    private static ArrayList<Artifact> getArtifacts(String parentFolder){
        ArrayList<Artifact> artifacts = new ArrayList<>();
        project.artifacts.forEach(a -> {
            if(a.parentFolder.equals(parentFolder))
                artifacts.add(a);
        });

        return artifacts;
    }

    public JSONObject toJSON(){
        JSONObject analytics = new JSONObject();
        JSONArray folders = new JSONArray();
        ArrayList<String> parentFolders = getParentFolders();
        analytics.put("projectName", project.name);
        analytics.put("numArtifacts", project.artifacts.size());
        analytics.put("numFolders", parentFolders.size());

        parentFolders.forEach(p -> {
            JSONObject folder = new JSONObject();
            JSONArray artifacts = new JSONArray();
            ArrayList<Artifact> folderArtifacts = getArtifacts(p);
            folder.put("folderName", p);
            folder.put("numArtifacts", folderArtifacts.size());

            folderArtifacts.forEach(a -> {
                JSONObject artifact = new JSONObject();
                JSONArray links = new JSONArray();
                artifact.put("artifactName", a.name);
                artifact.put("artifactID", a.id);
                artifact.put("artifactType", a.artifactType);
                artifact.put("numLinks", a.links.size());

                a.links.forEach(l -> {
                    JSONObject link = new JSONObject();
                    link.put("linkID", l.id);
                    link.put("linkType", l.linkType);
                    link.put("category", l.linkCategory);
                    String linkName = "";
                    String id = "";

                    for(Artifact art: project.artifacts){
                        if(art.itemId.equals(l.id)){
                            linkName = art.name;
                            id = art.id;
                        }
                    }

                    link.put("linkName", linkName);
                    link.put("id", id);
                    links.put(link);
                });

                artifact.put("links", links);
                artifacts.put(artifact);
            });

            folder.put("artifacts", artifacts);
            folders.put(folder);
        });

        analytics.put("folders", folders);

        return analytics;
    }
}
