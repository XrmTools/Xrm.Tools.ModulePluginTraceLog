

var rcApp = angular.module('moduleApp', ['ui.grid', 'ui.grid.resizeColumns','ui.grid.selection']);
rcApp.controller('moduleController', ['$scope', function ($scope) {
      
      $scope.treeOptions = {
         itemClicked: function(sourceItem, clickedElmDragged) {
            alert('selected item')
        }

        };

     $scope.queryResultGrid = {
        enableHorizontalScrollbar: 1,
        enableVerticalScrollbar: 1,
        enableRowSelection:true,
        enableSelectAll: false,
        multiSelect :false,
        columnDefs: [
                { field: 'corr', displayName: 'Correlation ID', width: 300 },
                { field: 'created_ODataFV', displayName: 'Created', width:150 },
                { field: 'plugincount', displayName: 'Plugin Count', width:150 },
                { field: 'maxdepth', displayName: 'Max Depth', width:150 },
                {   field:'totalduration_ODataFV', displayName: 'Duration', widt:150}
                                   ],
        selectionRowHeaderWidth: 35,
        onRegisterApi: function (gridApi) 
        {
            
             $scope.gridApi = gridApi;
             gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    $scope._LoadDetail(row);
      });

             }
       
    };
      
    $scope._LoadDetail= function(traceSummary)
    {
        
        var queryOption = {     
            OrderBy:['performanceconstructorstarttime asc', 'depth asc'],
            FormattedValues:true,
            Filter:"correlationid eq "+traceSummary.entity.corr
        };

   
        var crmAPI = $scope._getCRMAPI();
    
        crmAPI.GetList('plugintracelogs', queryOption).then(function (queryResult)
        {
            $scope.traceTreeItems = [];
            var lastParent = null;
            var lastChild = null;
             queryResult.List.forEach(function (row) {
                 for (prop in row) {                     
                     if (prop.indexOf('@OData') > -1)
                     {
                         row[prop.replace('@OData.Community.Display.V1.FormattedValue', '_ODataFV')] = row[prop];
                         delete row[prop];
                     }
                 }
                 var treeNode = new Object();
                 treeNode.id = row.plugintracelogid;
                 treeNode.title = row.typename;
                 if (row.exceptiondetails.length > 0)
                     treeNode.exception = row.exceptiondetails;
                 treeNode.depth = row.depth;
                 treeNode.primaryentity = row.primaryentity;
                 treeNode.messagename = row.messagename;
                 treeNode.messageblock =row.messageblock;
                 treeNode.duration = row.performanceexecutionduration_ODataFV;
                 
                 if (row.depth == 1)
                    treeNode.panelStyle = 'primary'
                 else if (row.depth == 2)
                    treeNode.panelStyle = 'success'
                    else if (row.depth == 3)
                    treeNode.panelStyle = 'info'
                     else if (row.depth == 4)
                    treeNode.panelStyle = 'warning'
                    else
                    treeNode.panelStyle='danger';
                    if (row.performanceexecutionduration > 500)
                       treeNode.stepmessagewarning = 'Warning Execution took ' + treeNode.duration;
                 treeNode.items = []
                 if (lastParent == null || row.depth == 1 )
                 {
                      $scope.traceTreeItems.push(treeNode);
                      lastParent = treeNode;
                 }
                 else
                    {
                        if (lastChild != null && treeNode.depth > lastChild.depth)
                        {
                            lastChild.items.push(treeNode);
                            lastChild.Parent = lastParent;
                            lastChild.childdepth = treeNode.depth;
                            lastParent = lastChild;
                            lastChild = treeNode;
                        }
                        else
                         if (lastParent != null && treeNode.depth < lastParent.childdepth)
                        {
                            lastParent = lastParent.Parent;
                            lastParent.items.push(treeNode);
                            lastChild = treeNode;
                        }
                        else
                        {
                            lastParent.childdepth = treeNode.depth;
                            lastChild = treeNode;
                            lastParent.items.push(treeNode);
                        }
                    }
             });
              $scope.$apply();
            
        }
        ,function(error)
        {	console.log(error);
        });
    }
    
    $scope._LoadPluginTraces= function()
    {
        var queryOption = {
            FormattedValues:true,
              FetchXml:"<fetch mapping='logical' aggregate='true'> <entity name='plugintracelog'><attribute name='correlationid' groupby='true' alias='corr' /><attribute name='performanceexecutionduration' aggregate='sum' alias='totalduration'/><attribute name='depth' aggregate='max' alias='maxdepth'/><attribute name='createdon' aggregate='min' alias='created'/><attribute name='correlationid' aggregate='count' alias='plugincount'/><order alias='created' descending='true' /></entity></fetch>"
    };


    $scope.queryResultGrid.data = null;
    
         
    var crmAPI = $scope._getCRMAPI();

    crmAPI.GetList('plugintracelogs', queryOption).then(function (queryResult)
    {
         
             queryResult.List.forEach(function (row) {
                 for (prop in row) {                     
                     if (prop.indexOf('@OData') > -1)
                     {
                         row[prop.replace('@OData.Community.Display.V1.FormattedValue', '_ODataFV')] = row[prop];
                         delete row[prop];
                     }
                 }
             });
             $scope.queryResults = queryResult.List;
             $scope.queryResultGrid.data = $scope.queryResults;
           //  $scope.queryResultGrid.enableColumnResize = true;
             $scope.gridApi.core.refresh();
           
        
             $scope.$apply();
    }
    ,function(error)
    {            
         console.log(error);
    });

    }
    
    $scope._getCRMAPI = function () {
        
        ///Use this configuration, when testing this as standalone page for testing 
        //You can get an Access Token from  https://xrm.tools/AccessToken 
        
        //var apiconfig = { APIUrl: 'https://orgname.crm.dynamics.com/api/data/v8.0/', AccessToken: '' };
        //var crmAPI = new CRMWebAPI(apiconfig);
        //return crmAPI;
        
        
        //Use this configuration for real use as a module installed into Xrm.Tools site
        var crmAPI = window.parent.crmAPI;
        return crmAPI;
    }
    
    $scope._LoadPluginTraces();
    
}]);