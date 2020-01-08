public class Link {
    String id;
    String linkType;
    String linkCategory;
    boolean isChildLink;
    boolean isParentLink;

    public Link(String id, String linkType, String linkCategory, boolean isChildLink, boolean isParentLink){
        this.id = id;
        this.linkType = linkType;
        this.linkCategory = linkCategory;
        this.isChildLink = isChildLink;
        this.isParentLink = isParentLink;
    }
}
