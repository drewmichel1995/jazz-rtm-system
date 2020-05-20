public class Link {
    String id;
    String linkType;
    String linkCategory;
    boolean isChildLink;
    boolean isParentLink;

    String title;
    String description;
    String format;
    String artifactFormat;
    String type;
    String linkTitle;

    public Link(String id, String linkType, String linkCategory, boolean isChildLink, boolean isParentLink){
        this.id = id;
        this.linkType = linkType;
        this.linkCategory = linkCategory;
        this.isChildLink = isChildLink;
        this.isParentLink = isParentLink;
        this.linkTitle = linkCategory;
        this.title = id;
        this.description = linkCategory;
        this.format = linkCategory;
        this.artifactFormat = linkCategory;
        this.type = linkType;
    }

    public Link(String id, String title, String description, String format, String artifactFormat, String type, String linkTitle){
        this.id = id;
        this.title = title;
        this.description = description;
        this.format = format;
        this.artifactFormat = artifactFormat;
        this.type = type;
        this.linkType = linkTitle;
        this.linkTitle = linkTitle;
        this.isChildLink = false;
        this.isParentLink = false;
        this.linkCategory = linkTitle;

    }
}
