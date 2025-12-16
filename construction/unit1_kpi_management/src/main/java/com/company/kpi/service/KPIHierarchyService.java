package com.company.kpi.service;

import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.KPIHierarchy;
import com.company.kpi.model.dto.KPIHierarchyResponse;
import com.company.kpi.repository.KPIDefinitionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing KPI hierarchies and cascading
 */
@Service
public class KPIHierarchyService {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIHierarchyService.class);
    
    @Autowired
    private KPIDefinitionRepository kpiDefinitionRepository;
    
    // In-memory storage for demo purposes
    private final List<KPIHierarchy> hierarchies = new ArrayList<>();
    
    /**
     * Get complete KPI hierarchy
     */
    public List<KPIHierarchyResponse> getHierarchy(KPIHierarchy.HierarchyLevel level, String parentId) {
        logger.debug("Getting KPI hierarchy for level: {}, parent: {}", level, parentId);
        
        // Initialize demo data if empty
        if (hierarchies.isEmpty()) {
            initializeDemoHierarchy();
        }
        
        List<KPIHierarchy> filteredHierarchies = hierarchies.stream()
            .filter(h -> level == null || h.getLevel() == level)
            .filter(h -> parentId == null || parentId.equals(h.getParentKpiId()))
            .collect(Collectors.toList());
        
        return buildHierarchyTree(filteredHierarchies, parentId);
    }
    
    /**
     * Get child KPIs for cascading
     */
    public List<KPIHierarchy> getCascadeChildren(String parentKpiId) {
        logger.debug("Getting cascade children for parent KPI: {}", parentKpiId);
        
        if (hierarchies.isEmpty()) {
            initializeDemoHierarchy();
        }
        
        return hierarchies.stream()
            .filter(h -> parentKpiId.equals(h.getParentKpiId()))
            .filter(KPIHierarchy::isActive)
            .collect(Collectors.toList());
    }
    
    /**
     * Create KPI hierarchy relationship
     */
    public KPIHierarchy createHierarchy(String parentKpiId, String childKpiId, 
                                       KPIHierarchy.HierarchyLevel level, String createdBy) {
        logger.info("Creating KPI hierarchy: parent={}, child={}, level={}", parentKpiId, childKpiId, level);
        
        // Validate KPIs exist
        validateKPIExists(parentKpiId);
        validateKPIExists(childKpiId);
        
        // Check for circular references
        if (hasCircularReference(parentKpiId, childKpiId)) {
            throw new IllegalArgumentException("Circular reference detected in KPI hierarchy");
        }
        
        KPIHierarchy hierarchy = new KPIHierarchy(parentKpiId, childKpiId, level, createdBy);
        hierarchy.setHierarchyId(UUID.randomUUID().toString());
        hierarchy.setWeightContribution(100.0); // Default full contribution
        hierarchy.setCascadeMultiplier(1.0); // Default no scaling
        
        hierarchies.add(hierarchy);
        
        logger.info("Successfully created KPI hierarchy with ID: {}", hierarchy.getHierarchyId());
        return hierarchy;
    }
    
    /**
     * Build hierarchical tree structure
     */
    private List<KPIHierarchyResponse> buildHierarchyTree(List<KPIHierarchy> hierarchies, String parentId) {
        Map<String, KPIHierarchyResponse> nodeMap = new HashMap<>();
        List<KPIHierarchyResponse> rootNodes = new ArrayList<>();
        
        // Create all nodes
        for (KPIHierarchy hierarchy : hierarchies) {
            String kpiId = hierarchy.getChildKpiId();
            if (!nodeMap.containsKey(kpiId)) {
                KPIDefinition kpiDef = kpiDefinitionRepository.findById(kpiId).orElse(null);
                String kpiName = kpiDef != null ? kpiDef.getName() : "Unknown KPI";
                
                KPIHierarchyResponse node = new KPIHierarchyResponse(kpiId, kpiName, hierarchy.getLevel());
                node.setParentKpiId(hierarchy.getParentKpiId());
                node.setWeightContribution(hierarchy.getWeightContribution());
                node.setCascadeMultiplier(hierarchy.getCascadeMultiplier());
                node.setUnitId(hierarchy.getUnitId());
                node.setChildren(new ArrayList<>());
                
                nodeMap.put(kpiId, node);
            }
        }
        
        // Build parent-child relationships
        for (KPIHierarchy hierarchy : hierarchies) {
            String parentKpiId = hierarchy.getParentKpiId();
            String childKpiId = hierarchy.getChildKpiId();
            
            if (parentKpiId == null || (parentId != null && !parentId.equals(parentKpiId))) {
                // Root node or filtered parent
                KPIHierarchyResponse childNode = nodeMap.get(childKpiId);
                if (childNode != null) {
                    rootNodes.add(childNode);
                }
            } else {
                // Child node
                KPIHierarchyResponse parentNode = nodeMap.get(parentKpiId);
                KPIHierarchyResponse childNode = nodeMap.get(childKpiId);
                
                if (parentNode != null && childNode != null) {
                    parentNode.getChildren().add(childNode);
                }
            }
        }
        
        return rootNodes;
    }
    
    /**
     * Initialize demo hierarchy data
     */
    private void initializeDemoHierarchy() {
        logger.info("Initializing demo KPI hierarchy data");
        
        // Company level KPIs
        KPIHierarchy companyRevenue = new KPIHierarchy(null, "kpi-001", KPIHierarchy.HierarchyLevel.COMPANY, "system");
        companyRevenue.setHierarchyId("hier-001");
        companyRevenue.setUnitId("company");
        hierarchies.add(companyRevenue);
        
        // Department level KPIs cascading from company
        KPIHierarchy salesRevenue = new KPIHierarchy("kpi-001", "kpi-002", KPIHierarchy.HierarchyLevel.DEPARTMENT, "system");
        salesRevenue.setHierarchyId("hier-002");
        salesRevenue.setUnitId("sales-dept");
        salesRevenue.setWeightContribution(60.0);
        hierarchies.add(salesRevenue);
        
        KPIHierarchy marketingROI = new KPIHierarchy("kpi-001", "kpi-005", KPIHierarchy.HierarchyLevel.DEPARTMENT, "system");
        marketingROI.setHierarchyId("hier-003");
        marketingROI.setUnitId("marketing-dept");
        marketingROI.setWeightContribution(40.0);
        hierarchies.add(marketingROI);
        
        // Individual level KPIs cascading from department
        KPIHierarchy individualSales = new KPIHierarchy("kpi-002", "kpi-003", KPIHierarchy.HierarchyLevel.INDIVIDUAL, "system");
        individualSales.setHierarchyId("hier-004");
        individualSales.setWeightContribution(80.0);
        hierarchies.add(individualSales);
        
        KPIHierarchy customerSat = new KPIHierarchy("kpi-002", "kpi-004", KPIHierarchy.HierarchyLevel.INDIVIDUAL, "system");
        customerSat.setHierarchyId("hier-005");
        customerSat.setWeightContribution(20.0);
        hierarchies.add(customerSat);
        
        logger.info("Initialized {} demo hierarchy relationships", hierarchies.size());
    }
    
    /**
     * Validate KPI exists
     */
    private void validateKPIExists(String kpiId) {
        if (!kpiDefinitionRepository.findById(kpiId).isPresent()) {
            throw new IllegalArgumentException("KPI not found: " + kpiId);
        }
    }
    
    /**
     * Check for circular references in hierarchy
     */
    private boolean hasCircularReference(String parentKpiId, String childKpiId) {
        Set<String> visited = new HashSet<>();
        return hasCircularReferenceRecursive(childKpiId, parentKpiId, visited);
    }
    
    private boolean hasCircularReferenceRecursive(String currentKpi, String targetKpi, Set<String> visited) {
        if (currentKpi.equals(targetKpi)) {
            return true;
        }
        
        if (visited.contains(currentKpi)) {
            return false;
        }
        
        visited.add(currentKpi);
        
        // Check all children of current KPI
        for (KPIHierarchy hierarchy : hierarchies) {
            if (currentKpi.equals(hierarchy.getParentKpiId())) {
                if (hasCircularReferenceRecursive(hierarchy.getChildKpiId(), targetKpi, visited)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}