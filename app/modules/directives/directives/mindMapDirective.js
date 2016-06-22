'use strict';

export default function($window) {

        return {
            scope: {
                root: "=",
                editable: "=",
                save: "&onSave",
                delete: "&onDelete",
                insert: "&onInsert"
            },

            restrict: "E",

            templateUrl: "./app/views/mindMap.html",

            link: function (scope, element) {

                //console.dir(scope.edit);
                // scope.edit({edit:function () {
                //     alert("Directive");
                // }});

                var selectedNode = {};

                var input = element.find("input");

                var selectedElement  = null;

                var isMenuVisible = false;

                var sideMenu = element.children(".sideMenu");


                function updateDimensions() {
                    w = element.prop('clientWidth') - m[1] - m[3] - (isMenuVisible?sideMenu.prop("clientWidth"):0);
                    h = element.prop('clientHeight') - m[0] - m[2];
                    canvas.attr("width", element.prop("clientWidth"))
                        .attr("height", element.prop("clientWidth"));
                    update(scope.root);
                }

                function showSideMenu() {
                    sideMenu.removeClass("menuHidden");
                    isMenuVisible = true;
                    updateDimensions();
                }

                function hideSideMenu() {
                    sideMenu.addClass("menuHidden");
                    isMenuVisible = false;
                    updateDimensions();
                }

                function deselectNode() {
                    if (selectedElement != null) {
                        selectedElement.select("circle").classed("selected", false);
                        selectedNode.name = selectedNode._name;
                        checkNodeName();
                    }
                }

                function selectNode(d) {
                    deselectNode();

                    selectedNode = d;
                    selectedNode._name = selectedNode.name;
                    
                    selectedElement = d3.select(this);
                    selectedElement.select("circle").classed("selected",true);

                    showSideMenu();

                    scope.$apply(function () {
                        scope.nodeName = d.name;
                    });
                }

                function checkNode(d) {

                    function check(d) {
                        d.checked = true;
                        if (d.parent) check(d.parent);
                    }
                    function uncheck(d) {
                        d.checked = false;
                        if (d.children) d.children.forEach(uncheck);
                    }

                    d.checked ? uncheck(d) : check(d);

                    update(scope.root);
                }

                function clearSelection() {
                    deselectNode();
                    update(scope.root);
                    hideSideMenu();
                }

                function checkNodeName() {
                    if (selectedElement) {
                        var textNode = selectedElement.select("g.container").select("text");
                        if (selectedNode.name != selectedNode._name) textNode.style("fill", "gray");
                        else textNode.style("fill", "black");
                    }
                }

                //updating selected node text without calling update method
                function updateSelectedText() {
                    if (selectedElement != null) {
                        var textNode = selectedElement.select("g.container").select("text");
                        textNode.text(scope.nodeName);
                        selectedNode.name = scope.nodeName;

                        var textWidth = textNode.node().getBBox().width;

                        if (!scope.editable) {
                            var checkboxContainer = selectedElement.select("g.checkbox");

                            var checkboxWidth = checkboxContainer.select("rect").attr("width");

                            var side = textNode.attr("text-anchor") === "start" ? 1 : -1;
                            var checkboxOffset = side * (textWidth + checkboxWidth * (side === -1 ? 2 : 1));

                            checkboxContainer.attr("transform", "translate(" + checkboxOffset + " -8)");
                        }
                    }
                }
                
                scope.addNewNode = function () {
                    var newNode = {
                        "depth": selectedNode.depth + 1,
                        "name": "new Node",
                        "parent": selectedNode
                    };
                    scope.insert({node:newNode,
                    success: function (id) {
                        newNode._id = id;
                        if (!selectedNode.children) selectedNode.children = [];
                        selectedNode.children.push(newNode);
                        update(selectedNode);
                    }, fail: function () {
                        //TODO: show notification
                    }});
                };

                scope.removeNode = function () {
                    if (!selectedNode.parent) {
                        alert("Cannot remove root");
                        return;
                    }
                    scope.delete({node: selectedNode,
                        success: function () {
                            var thisId = selectedNode.id;
                            selectedNode.parent.children.forEach(function (c, index) {
                                if (thisId === c.id) {
                                    selectedNode.parent.children.splice(index, 1);
                                }
                            });
                            update(selectedNode.parent);
                            clearSelection();
                        }, fail: function () {
                            //TODO: show notification
                        }
                    })
                };

                scope.onSave = function() {
                    scope.save({node: selectedNode,
                    success: function () {
                        selectedNode._name = scope.nodeName;
                        checkNodeName();
                    }, fail: function () {
                        //TODO: show notification
                    }});
                };

                $window.onresize = function () {
                    updateDimensions();
                };

                scope.$watch('root', function () {
                    if (!(scope.root != null)) {
                        scope.root = {
                            "name": "root"
                        }
                    }
                    scope.root.x0 = h / 2;
                    scope.root.y0 = 0;
                    update(scope.root);
                });

                scope.$watch('nodeName', function () {
                    updateSelectedText();
                    checkNodeName();
                });

                var eleW = element.prop("clientWidth"),
                    eleH = element.prop("clientHeight");

                var m = [20, 40, 20, 80],
                    w = eleW - m[1] - m[3],
                    h = eleH - m[0] - m[2],
                    i = 0;

                var tree = d3.layout.tree().size([h, w]);

                var diagonal = d3.svg.diagonal().projection(function (d) {
                    return [d.y, d.x];
                });

                var canvas = d3.select(element[0]).append("svg:svg")
                    .attr("width", eleW  )
                    .attr("height", eleH )
                    .on("click", function() {
                        if (d3.event.target.nodeName != "svg" ) return;
                        clearSelection();
                    });

                var vis = canvas.append("svg:g")
                    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

                




                function update(source) {

                    if (!(source != null)) {
                        return;
                    }

                    var duration = 300;
                    // Compute the new tree layout.

                    function getDepth(root) {
                        if (!root.children) return 1;
                        var depths = root.children.map(function (child) {
                            return getDepth(child);
                        });
                        return Math.max(...depths) + 1;
                    }

                    var offset = w / getDepth(scope.root);

                    var nodes = tree.size([h, w-offset]).nodes(scope.root).reverse();

                    // Update the nodes…
                    var node = vis.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });

                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("svg:g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.y0 + "," + source.x0 + ")";
                        });

                    if (scope.editable) {
                        nodeEnter.on("click", function (d) {
                            selectNode.call(this, d);
                        });
                    } else {
                        nodeEnter.on("click", function (d) {
                            checkNode.call(this, d);
                        });
                    }


                    //inject content to node
                    InjectNodeContent(nodeEnter);

                    // Transition nodes to their new position.
                    var nodeUpdate = node
                        .transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        });

                    nodeUpdate.select("circle")
                        .attr("r", 4.5)
                        .style("fill", function (d) {
                            return d._children ? "lightsteelblue" : "#fff";
                        });

                    nodeUpdate.select("text")
                        .text(function (d) {
                            return d.name;
                        })
                        .style("fill-opacity", 1);

                    nodeUpdate.select("g.checkbox")
                        .attr("class", function (d) {
                            return ("checkbox" + (d.checked ? " checked" : ""));
                        });

                    // Transition exiting nodes to the parent's new position.
                    var nodeExit = node.exit()
                        .transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.y + "," + source.x + ")";
                        })
                        .remove();

                    nodeExit.select("circle")
                        .attr("r", 1e-6);

                    nodeExit.select("text")
                        .style("fill-opacity", 1e-6);

                    // Update the links…
                    var link = vis.selectAll("path.link")
                        .data(tree.links(nodes), function (d) {
                            return d.target.id;
                        });

                    // Enter any new links at the parent's previous position.
                    link.enter().insert("svg:path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                            var o = {x: source.x0, y: source.y0};
                            return diagonal({source: o, target: o});
                        })
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition links to their new position.
                    link
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition exiting nodes to the parent's new position.
                    link.exit()
                        .transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = {x: source.x, y: source.y};
                            return diagonal({source: o, target: o});
                        })
                        .remove();

                    // Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                }


                function InjectNodeContent(nodeEnter) {

                    var innerContainer = nodeEnter.append("svg:g")
                        .attr("class", "container");

                    innerContainer.append("svg:circle")
                        .attr("r", 1e-6)
                        .style("fill", function (d) {
                            return d._children ? "lightsteelblue" : "#fff";
                        })
                        .classed("toggleCircle", true);


                    var textNodes = innerContainer.append("svg:text")
                        .attr("x", function (d) {
                            return d.children || d._children ? -10 : 10;
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) {
                            return d.children || d._children ? "end" : "start";
                        })
                        .text(function (d) {
                            return d.name;
                        })
                        .style("fill-opacity", 1e-6);



                    if (!scope.editable) {
                        var checkbox = nodeEnter.append("svg:g")
                            .attr("class", function (d) {
                                return ("checkbox" + (d.checked ? " checked" : ""));
                            });

                        checkbox.append("svg:rect")
                            .attr("width", 15)
                            .attr("height", 15);
                        //.attr("y", "-.5em");

                        checkbox.append("svg:path")
                            .attr("d", "m0.184632,7.869125l5.520013,6.694498l8.926091,-12.147537l-8.590524,7.785162l-5.85558,-2.332122z");
                        //.attr("d", "-.5em");

                        checkbox.attr("transform", function (d, i) {
                            //var textNode = textNodes.filter((d, ei) => ei === i);

                            var textNode = d3.select(this.parentNode).select("text");

                            var side = -1;  //The text is on the left side
                            if (textNode.attr("text-anchor") === "start") side = 1; //The text is on the right side

                            var offsetX = side * (textNode.node().getBBox().width
                                + d3.select(this).select("rect").attr("width")
                                * (side === -1 ? 2 : 1));
                            return ("translate(" + offsetX + " -8)");
                        });
                    }
                }
            }
        };
}