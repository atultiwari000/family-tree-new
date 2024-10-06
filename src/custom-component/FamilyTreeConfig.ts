import FamilyTree from "@balkangraph/familytree.js";

export const FamilyTreeConfig = (
  handleEdit: (nodeId: string) => void,
  handleAdd: (nodeId: string) => void,
  handleRemove: (nodeId: string) => void
) => ({
  template: "rabin",
  nodeBinding: {
    field_0: "name",
    img_0: "img",
  },
  levelSeparation: 100,
  siblingSeparation: 50,
  subtreeSeparation: 100,
  nodeMenu: {
    edit: {
      text: "Edit",
      icon: '<i class="fas fa-edit"></i>',
      onClick: handleEdit,
    },
    add: {
      text: "Add",
      icon: '<i class="fas fa-plus"></i>',
      onClick: handleAdd,
    },
    remove: {
      text: "Remove",
      icon: '<i class="fas fa-trash"></i>',
      onClick: handleRemove,
    },
  },
});