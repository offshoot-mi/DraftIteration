// Rewrite/client/src/components/Admin/ContentFamilyTree.jsx
import React, { useMemo } from 'react';
import TreeNode from './TreeNode';

const ContentFamilyTree = ({ allContentItems, onContentDeleted }) => {
  // useMemo prevents rebuilding the tree on every render unless the source data changes
  const treeData = useMemo(() => {
    if (!allContentItems || allContentItems.length === 0) return [];

    const map = {};
    const roots = [];

    // First pass: create a map for easy lookup and initialize children arrays
    allContentItems.forEach(item => {
      map[item.id] = { ...item, childrenNodes: [] };
    });

    // Second pass: link children to their parents
    allContentItems.forEach(item => {
      if (item.parentContent && map[item.parentContent]) {
        if (!map[item.parentContent].childrenNodes.some(child => child.id === item.id)) {
            map[item.parentContent].childrenNodes.push(map[item.id]);
        }
      } else if (!item.parentContent) {
        if (!roots.some(root => root.id === item.id)) {
            roots.push(map[item.id]);
        }
      }
    });

    // Sort children by creation date for consistent display
    Object.values(map).forEach(node => {
        if (node.childrenNodes.length > 1) {
            node.childrenNodes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
    });
    // Sort root nodes by creation date
    roots.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest roots first

    return roots;
  }, [allContentItems]);

  if (!treeData || treeData.length === 0) {
    return <p className="text-center" style={{padding:"1rem"}}>No content structure to display.</p>;
  }

  return (
    <div className="content-tree card" style={{padding:"1.5rem", background:"#fff"}}>
      <h2 style={{marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.75rem', fontSize:"1.4rem"}}>Content Hierarchy</h2>
      <ul style={{listStyleType: 'none', paddingLeft: '0'}}>
        {treeData.map(rootNode => (
          <TreeNode
            key={rootNode.id}
            node={rootNode}
            onContentDeleted={onContentDeleted}
            level={0} // Starting level for indentation
          />
        ))}
      </ul>
    </div>
  );
};

export default ContentFamilyTree;