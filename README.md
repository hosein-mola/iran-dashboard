This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
pm2 delete website
pm2 start app.js --name "website"
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

.
├── actions
│   └── form.ts
├── api
│   └── apiConfig.ts
├── components
│   ├── actions
│   │   ├── elementOverDesinger.ts
│   │   ├── elementOverElement.ts
│   │   ├── elementOverPanel.ts
│   │   ├── pageOverPage.ts
│   │   ├── sidebarOrElementOverPage.ts
│   │   ├── sidebarOverDesigner.ts
│   │   └── sidebarOverElement.ts
│   ├── app-sidebar.tsx
│   ├── Chart1.tsx
│   ├── Chart2.tsx
│   ├── context
│   │   └── DesignerContext.tsx
│   ├── CreateFormButton.tsx
│   ├── data-grid.tsx
│   ├── datepicker-input.tsx
│   ├── date-picker.tsx
│   ├── DesignerNestedTree.tsx
│   ├── DesignerPageList.tsx
│   ├── DesignerSidebar.tsx
│   ├── Designer.tsx
│   ├── DragOverlayWrapper.tsx
│   ├── drawer.tsx
│   ├── fields
│   │   ├── FlexField.tsx
│   │   ├── PanelField.tsx
│   │   └── TextField.tsx
│   ├── FormBuilder.tsx
│   ├── FormElementSidebar.tsx
│   ├── FormLinkShare.tsx
│   ├── FormSubmitComponent.tsx
│   ├── header-dropdown.tsx
│   ├── hooks
│   │   └── useDesigner.tsx
│   ├── loader.tsx
│   ├── login-form.tsx
│   ├── logo.tsx
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   ├── nav-user.tsx
│   ├── persons
│   │   └── person-filter.tsx
│   ├── PreviewDialogButton.tsx
│   ├── PropertiesFormSidebar.tsx
│   ├── providers
│   │   └── ThemeProvider.tsx
│   ├── PublishFormButton.tsx
│   ├── SaveFormButton.tsx
│   ├── search-form.tsx
│   ├── SidebarBtnElement.tsx
│   ├── simple-grid.tsx
│   ├── table-wraper.tsx
│   ├── team-switcher.tsx
│   ├── theme-changer.tsx
│   ├── ThemeSwitcher.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── collapsible.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toaster.tsx
│   │   ├── toast.tsx
│   │   ├── tooltip.tsx
│   │   └── use-toast.ts
│   ├── version-switcher.tsx
│   └── VisitBtn.tsx
├── components.json
├── eslint.config.mjs
├── hooks
│   ├── use-fetch-json.tsx
│   └── use-mobile.ts
├── lib
│   ├── prisma.ts
│   ├── tree.ts
│   └── utils.ts
├── next.config.ts
├── next-env.d.ts
├── package
│   ├── ag-charts-enterprise
│   │   ├── dist
│   │   │   ├── package
│   │   │   │   ├── main.cjs.js
│   │   │   │   ├── main.cjs.min.js
│   │   │   │   ├── main.esm.min.mjs
│   │   │   │   ├── main.esm.mjs
│   │   │   │   ├── main-modules.cjs.js
│   │   │   │   ├── main-modules.cjs.min.js
│   │   │   │   ├── main-modules.esm.min.mjs
│   │   │   │   └── main-modules.esm.mjs
│   │   │   ├── types
│   │   │   │   └── src
│   │   │   │   ├── axes
│   │   │   │   │   ├── angle
│   │   │   │   │   │   └── angleAxis.d.ts
│   │   │   │   │   ├── angle-category
│   │   │   │   │   │   ├── angleCategoryAxis.d.ts
│   │   │   │   │   │   ├── angleCategoryAxisModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── angle-number
│   │   │   │   │   │   ├── angleAxisInterval.d.ts
│   │   │   │   │   │   ├── angleNumberAxis.d.ts
│   │   │   │   │   │   ├── angleNumberAxisModule.d.ts
│   │   │   │   │   │   ├── linearAngleScale.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── axisModules.d.ts
│   │   │   │   │   ├── ordinal
│   │   │   │   │   │   ├── ordinalTimeAxis.d.ts
│   │   │   │   │   │   └── ordinalTimeAxisModule.d.ts
│   │   │   │   │   ├── polar-crosslines
│   │   │   │   │   │   ├── angleCrossLine.d.ts
│   │   │   │   │   │   ├── polarCrossLine.d.ts
│   │   │   │   │   │   └── radiusCrossLine.d.ts
│   │   │   │   │   ├── radius
│   │   │   │   │   │   └── radiusAxis.d.ts
│   │   │   │   │   ├── radius-category
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radiusCategoryAxis.d.ts
│   │   │   │   │   │   └── radiusCategoryAxisModule.d.ts
│   │   │   │   │   └── radius-number
│   │   │   │   │   ├── main.d.ts
│   │   │   │   │   ├── radiusNumberAxis.d.ts
│   │   │   │   │   └── radiusNumberAxisModule.d.ts
│   │   │   │   ├── charts
│   │   │   │   │   ├── flowProportionChart.d.ts
│   │   │   │   │   ├── flowProportionChartModule.d.ts
│   │   │   │   │   ├── gaugeChart.d.ts
│   │   │   │   │   ├── gaugeChartModule.d.ts
│   │   │   │   │   ├── hierarchyChart.d.ts
│   │   │   │   │   ├── hierarchyChartModule.d.ts
│   │   │   │   │   ├── standaloneChart.d.ts
│   │   │   │   │   ├── standaloneChartModule.d.ts
│   │   │   │   │   ├── topologyChart.d.ts
│   │   │   │   │   └── topologyChartModule.d.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── color-picker
│   │   │   │   │   │   └── colorPicker.d.ts
│   │   │   │   │   └── dialog
│   │   │   │   │   └── dialog.d.ts
│   │   │   │   ├── features
│   │   │   │   │   ├── animation
│   │   │   │   │   │   ├── animation.d.ts
│   │   │   │   │   │   ├── animationModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── annotations
│   │   │   │   │   │   ├── annotationAxesButtons.d.ts
│   │   │   │   │   │   ├── annotationDefaults.d.ts
│   │   │   │   │   │   ├── annotationOptionsDef.d.ts
│   │   │   │   │   │   ├── annotationOptionsToolbar.d.ts
│   │   │   │   │   │   ├── annotationProperties.d.ts
│   │   │   │   │   │   ├── annotationsConfig.d.ts
│   │   │   │   │   │   ├── annotations.d.ts
│   │   │   │   │   │   ├── annotationsMenuOptions.d.ts
│   │   │   │   │   │   ├── annotationsModule.d.ts
│   │   │   │   │   │   ├── annotationsStateMachine.d.ts
│   │   │   │   │   │   ├── annotationsSuperTypes.d.ts
│   │   │   │   │   │   ├── annotationsTheme.d.ts
│   │   │   │   │   │   ├── annotationsToolbar.d.ts
│   │   │   │   │   │   ├── annotationTypes.d.ts
│   │   │   │   │   │   ├── arrow-down
│   │   │   │   │   │   │   ├── arrowDownConfig.d.ts
│   │   │   │   │   │   │   ├── arrowDownProperties.d.ts
│   │   │   │   │   │   │   ├── arrowDownScene.d.ts
│   │   │   │   │   │   │   └── arrowDownState.d.ts
│   │   │   │   │   │   ├── arrow-up
│   │   │   │   │   │   │   ├── arrowUpConfig.d.ts
│   │   │   │   │   │   │   ├── arrowUpProperties.d.ts
│   │   │   │   │   │   │   ├── arrowUpScene.d.ts
│   │   │   │   │   │   │   └── arrowUpState.d.ts
│   │   │   │   │   │   ├── axisButton.d.ts
│   │   │   │   │   │   ├── callout
│   │   │   │   │   │   │   ├── calloutConfig.d.ts
│   │   │   │   │   │   │   ├── calloutProperties.d.ts
│   │   │   │   │   │   │   ├── calloutScene.d.ts
│   │   │   │   │   │   │   └── calloutState.d.ts
│   │   │   │   │   │   ├── comment
│   │   │   │   │   │   │   ├── commentConfig.d.ts
│   │   │   │   │   │   │   ├── commentProperties.d.ts
│   │   │   │   │   │   │   ├── commentScene.d.ts
│   │   │   │   │   │   │   └── commentState.d.ts
│   │   │   │   │   │   ├── cross-line
│   │   │   │   │   │   │   ├── crossLineConfig.d.ts
│   │   │   │   │   │   │   ├── crossLineProperties.d.ts
│   │   │   │   │   │   │   ├── crossLineScene.d.ts
│   │   │   │   │   │   │   └── crossLineState.d.ts
│   │   │   │   │   │   ├── disjoint-channel
│   │   │   │   │   │   │   ├── disjointChannelConfig.d.ts
│   │   │   │   │   │   │   ├── disjointChannelProperties.d.ts
│   │   │   │   │   │   │   ├── disjointChannelScene.d.ts
│   │   │   │   │   │   │   └── disjointChannelState.d.ts
│   │   │   │   │   │   ├── fibonacci-retracement
│   │   │   │   │   │   │   ├── fibonacciRetracementConfig.d.ts
│   │   │   │   │   │   │   ├── fibonacciRetracementProperties.d.ts
│   │   │   │   │   │   │   ├── fibonacciRetracementScene.d.ts
│   │   │   │   │   │   │   └── fibonacciRetracementState.d.ts
│   │   │   │   │   │   ├── fibonacci-retracement-trend-based
│   │   │   │   │   │   │   ├── fibonacciRetracementTrendBasedConfig.d.ts
│   │   │   │   │   │   │   ├── fibonacciRetracementTrendBasedProperties.d.ts
│   │   │   │   │   │   │   ├── fibonacciRetracementTrendBasedScene.d.ts
│   │   │   │   │   │   │   └── fibonacciRetracementTrendBasedState.d.ts
│   │   │   │   │   │   ├── line
│   │   │   │   │   │   │   ├── lineConfig.d.ts
│   │   │   │   │   │   │   ├── lineProperties.d.ts
│   │   │   │   │   │   │   ├── lineScene.d.ts
│   │   │   │   │   │   │   └── lineState.d.ts
│   │   │   │   │   │   ├── measurer
│   │   │   │   │   │   │   ├── measurerConfig.d.ts
│   │   │   │   │   │   │   ├── measurerProperties.d.ts
│   │   │   │   │   │   │   ├── measurerScene.d.ts
│   │   │   │   │   │   │   ├── measurerState.d.ts
│   │   │   │   │   │   │   └── measurerStatisticsScene.d.ts
│   │   │   │   │   │   ├── note
│   │   │   │   │   │   │   ├── noteConfig.d.ts
│   │   │   │   │   │   │   ├── noteProperties.d.ts
│   │   │   │   │   │   │   ├── noteScene.d.ts
│   │   │   │   │   │   │   └── noteState.d.ts
│   │   │   │   │   │   ├── parallel-channel
│   │   │   │   │   │   │   ├── parallelChannelConfig.d.ts
│   │   │   │   │   │   │   ├── parallelChannelProperties.d.ts
│   │   │   │   │   │   │   ├── parallelChannelScene.d.ts
│   │   │   │   │   │   │   └── parallelChannelState.d.ts
│   │   │   │   │   │   ├── properties
│   │   │   │   │   │   │   ├── fibonacciProperties.d.ts
│   │   │   │   │   │   │   ├── pointProperties.d.ts
│   │   │   │   │   │   │   ├── shapePointProperties.d.ts
│   │   │   │   │   │   │   ├── startEndProperties.d.ts
│   │   │   │   │   │   │   ├── textualPointProperties.d.ts
│   │   │   │   │   │   │   └── textualStartEndProperties.d.ts
│   │   │   │   │   │   ├── scenes
│   │   │   │   │   │   │   ├── annotationScene.d.ts
│   │   │   │   │   │   │   ├── axisLabelScene.d.ts
│   │   │   │   │   │   │   ├── capScene.d.ts
│   │   │   │   │   │   │   ├── channelScene.d.ts
│   │   │   │   │   │   │   ├── collidableLineScene.d.ts
│   │   │   │   │   │   │   ├── collidableTextScene.d.ts
│   │   │   │   │   │   │   ├── fibonacciScene.d.ts
│   │   │   │   │   │   │   ├── handle.d.ts
│   │   │   │   │   │   │   ├── linearScene.d.ts
│   │   │   │   │   │   │   ├── pointScene.d.ts
│   │   │   │   │   │   │   ├── shapePointScene.d.ts
│   │   │   │   │   │   │   ├── startEndScene.d.ts
│   │   │   │   │   │   │   ├── textualPointScene.d.ts
│   │   │   │   │   │   │   ├── textualStartEndScene.d.ts
│   │   │   │   │   │   │   └── withBackgroundScene.d.ts
│   │   │   │   │   │   ├── settings-dialog
│   │   │   │   │   │   │   └── settingsDialog.d.ts
│   │   │   │   │   │   ├── states
│   │   │   │   │   │   │   ├── dragState.d.ts
│   │   │   │   │   │   │   ├── pointState.d.ts
│   │   │   │   │   │   │   ├── stateTypes.d.ts
│   │   │   │   │   │   │   ├── textualPointState.d.ts
│   │   │   │   │   │   │   ├── textualStartEndState.d.ts
│   │   │   │   │   │   │   └── textualStateUtils.d.ts
│   │   │   │   │   │   ├── text
│   │   │   │   │   │   │   ├── textConfig.d.ts
│   │   │   │   │   │   │   ├── textProperties.d.ts
│   │   │   │   │   │   │   ├── textScene.d.ts
│   │   │   │   │   │   │   ├── textState.d.ts
│   │   │   │   │   │   │   └── util.d.ts
│   │   │   │   │   │   └── utils
│   │   │   │   │   │   ├── axis.d.ts
│   │   │   │   │   │   ├── coords.d.ts
│   │   │   │   │   │   ├── fibonacci.d.ts
│   │   │   │   │   │   ├── has.d.ts
│   │   │   │   │   │   ├── layout.d.ts
│   │   │   │   │   │   ├── line.d.ts
│   │   │   │   │   │   ├── lineWithText.d.ts
│   │   │   │   │   │   ├── scale.d.ts
│   │   │   │   │   │   ├── styles.d.ts
│   │   │   │   │   │   ├── types.d.ts
│   │   │   │   │   │   ├── update.d.ts
│   │   │   │   │   │   ├── validation.d.ts
│   │   │   │   │   │   └── values.d.ts
│   │   │   │   │   ├── background
│   │   │   │   │   │   ├── background.d.ts
│   │   │   │   │   │   ├── backgroundModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── chart-toolbar
│   │   │   │   │   │   ├── chartToolbar.d.ts
│   │   │   │   │   │   ├── chartToolbarModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── context-menu
│   │   │   │   │   │   ├── contextMenu.d.ts
│   │   │   │   │   │   ├── contextMenuModule.d.ts
│   │   │   │   │   │   ├── contextMenuStyles.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── crosshair
│   │   │   │   │   │   ├── crosshair.d.ts
│   │   │   │   │   │   ├── crosshairLabel.d.ts
│   │   │   │   │   │   ├── crosshairModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── data-source
│   │   │   │   │   │   ├── dataSource.d.ts
│   │   │   │   │   │   ├── dataSourceModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── error-bar
│   │   │   │   │   │   ├── errorBar.d.ts
│   │   │   │   │   │   ├── errorBarModule.d.ts
│   │   │   │   │   │   ├── errorBarNode.d.ts
│   │   │   │   │   │   ├── errorBarProperties.d.ts
│   │   │   │   │   │   └── errorBarTheme.d.ts
│   │   │   │   │   ├── foreground
│   │   │   │   │   │   ├── foreground.d.ts
│   │   │   │   │   │   ├── foregroundModule.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── image
│   │   │   │   │   │   └── image.d.ts
│   │   │   │   │   ├── navigator
│   │   │   │   │   │   ├── miniChart.d.ts
│   │   │   │   │   │   ├── navigatorDOMProxy.d.ts
│   │   │   │   │   │   ├── navigator.d.ts
│   │   │   │   │   │   ├── navigatorModule.d.ts
│   │   │   │   │   │   ├── navigatorOptionsDefs.d.ts
│   │   │   │   │   │   ├── navigatorTheme.d.ts
│   │   │   │   │   │   └── shapes
│   │   │   │   │   │   ├── miniChartGroup.d.ts
│   │   │   │   │   │   ├── rangeHandle.d.ts
│   │   │   │   │   │   ├── rangeMask.d.ts
│   │   │   │   │   │   └── rangeSelector.d.ts
│   │   │   │   │   ├── ranges
│   │   │   │   │   │   ├── rangesButtonProperties.d.ts
│   │   │   │   │   │   ├── ranges.d.ts
│   │   │   │   │   │   └── rangesModule.d.ts
│   │   │   │   │   ├── shared-toolbar
│   │   │   │   │   │   ├── sharedToolbar.d.ts
│   │   │   │   │   │   ├── sharedToolbarModule.d.ts
│   │   │   │   │   │   └── sharedToolbarTypes.d.ts
│   │   │   │   │   ├── status-bar
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── statusBar.d.ts
│   │   │   │   │   │   └── statusBarModule.d.ts
│   │   │   │   │   ├── sync
│   │   │   │   │   │   ├── chartSync.d.ts
│   │   │   │   │   │   ├── pluginModules.d.ts
│   │   │   │   │   │   └── syncModule.d.ts
│   │   │   │   │   ├── text-input
│   │   │   │   │   │   └── textInput.d.ts
│   │   │   │   │   └── zoom
│   │   │   │   │   ├── main.d.ts
│   │   │   │   │   ├── scenes
│   │   │   │   │   │   └── zoomRect.d.ts
│   │   │   │   │   ├── zoomAxisDragger.d.ts
│   │   │   │   │   ├── zoomContextMenu.d.ts
│   │   │   │   │   ├── zoomDOMProxy.d.ts
│   │   │   │   │   ├── zoom.d.ts
│   │   │   │   │   ├── zoomModule.d.ts
│   │   │   │   │   ├── zoomPanner.d.ts
│   │   │   │   │   ├── zoomScroller.d.ts
│   │   │   │   │   ├── zoomScrollPanner.d.ts
│   │   │   │   │   ├── zoomSelector.d.ts
│   │   │   │   │   ├── zoomToolbar.d.ts
│   │   │   │   │   ├── zoomTwoFingers.d.ts
│   │   │   │   │   ├── zoomTypes.d.ts
│   │   │   │   │   └── zoomUtils.d.ts
│   │   │   │   ├── gradient-legend
│   │   │   │   │   ├── gradientLegend.d.ts
│   │   │   │   │   └── gradientLegendModule.d.ts
│   │   │   │   ├── license
│   │   │   │   │   ├── licenseManager.d.ts
│   │   │   │   │   ├── md5.d.ts
│   │   │   │   │   └── watermark.d.ts
│   │   │   │   ├── main.d.ts
│   │   │   │   ├── main-modules.d.ts
│   │   │   │   ├── series
│   │   │   │   │   ├── bar
│   │   │   │   │   │   ├── barAggregation.d.ts
│   │   │   │   │   │   ├── barModule.d.ts
│   │   │   │   │   │   └── barSeries.d.ts
│   │   │   │   │   ├── box-plot
│   │   │   │   │   │   ├── blotPlotUtil.d.ts
│   │   │   │   │   │   ├── boxPlotGroup.d.ts
│   │   │   │   │   │   ├── boxPlotModule.d.ts
│   │   │   │   │   │   ├── boxPlotSeries.d.ts
│   │   │   │   │   │   ├── boxPlotSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── boxPlotSeriesProperties.d.ts
│   │   │   │   │   │   ├── boxPlotThemes.d.ts
│   │   │   │   │   │   ├── boxPlotTypes.d.ts
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── candlestick
│   │   │   │   │   │   ├── candlestickModule.d.ts
│   │   │   │   │   │   ├── candlestickNode.d.ts
│   │   │   │   │   │   ├── candlestickSeries.d.ts
│   │   │   │   │   │   ├── candlestickSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── candlestickSeriesProperties.d.ts
│   │   │   │   │   │   ├── candlestickThemes.d.ts
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── chord
│   │   │   │   │   │   ├── chordLink.d.ts
│   │   │   │   │   │   ├── chordModule.d.ts
│   │   │   │   │   │   ├── chordSeries.d.ts
│   │   │   │   │   │   ├── chordSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── chordSeriesProperties.d.ts
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── cone-funnel
│   │   │   │   │   │   ├── coneFunnelModule.d.ts
│   │   │   │   │   │   ├── coneFunnelProperties.d.ts
│   │   │   │   │   │   ├── coneFunnelSeries.d.ts
│   │   │   │   │   │   ├── coneFunnelSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── coneFunnelThemes.d.ts
│   │   │   │   │   │   ├── coneFunnelUtil.d.ts
│   │   │   │   │   │   └── index.d.ts
│   │   │   │   │   ├── flow-proportion
│   │   │   │   │   │   ├── flowProportionProperties.d.ts
│   │   │   │   │   │   ├── flowProportionSeries.d.ts
│   │   │   │   │   │   └── flowProportionUtil.d.ts
│   │   │   │   │   ├── funnel
│   │   │   │   │   │   ├── baseFunnelSeries.d.ts
│   │   │   │   │   │   ├── baseFunnelSeriesProperties.d.ts
│   │   │   │   │   │   ├── funnelConnector.d.ts
│   │   │   │   │   │   ├── funnelModule.d.ts
│   │   │   │   │   │   ├── funnelProperties.d.ts
│   │   │   │   │   │   ├── funnelSeries.d.ts
│   │   │   │   │   │   ├── funnelSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── funnelThemes.d.ts
│   │   │   │   │   │   ├── funnelUtil.d.ts
│   │   │   │   │   │   └── index.d.ts
│   │   │   │   │   ├── gauge-util
│   │   │   │   │   │   ├── datumUnion.d.ts
│   │   │   │   │   │   ├── label.d.ts
│   │   │   │   │   │   ├── lineMarker.d.ts
│   │   │   │   │   │   ├── pick.d.ts
│   │   │   │   │   │   ├── properties.d.ts
│   │   │   │   │   │   └── segmentation.d.ts
│   │   │   │   │   ├── heatmap
│   │   │   │   │   │   ├── heatmapModule.d.ts
│   │   │   │   │   │   ├── heatmapSeries.d.ts
│   │   │   │   │   │   ├── heatmapSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── heatmapSeriesProperties.d.ts
│   │   │   │   │   │   ├── heatmapThemes.d.ts
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── line
│   │   │   │   │   │   ├── lineAggregation.d.ts
│   │   │   │   │   │   ├── lineModule.d.ts
│   │   │   │   │   │   └── lineSeries.d.ts
│   │   │   │   │   ├── linear-gauge
│   │   │   │   │   │   ├── linearGaugeModule.d.ts
│   │   │   │   │   │   ├── linearGaugeSeries.d.ts
│   │   │   │   │   │   ├── linearGaugeSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── linearGaugeSeriesProperties.d.ts
│   │   │   │   │   │   ├── linearGaugeUtil.d.ts
│   │   │   │   │   │   └── main.d.ts
│   │   │   │   │   ├── map-line
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── mapLineModule.d.ts
│   │   │   │   │   │   ├── mapLineSeries.d.ts
│   │   │   │   │   │   ├── mapLineSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── mapLineSeriesProperties.d.ts
│   │   │   │   │   ├── map-line-background
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── mapLineBackgroundModule.d.ts
│   │   │   │   │   │   ├── mapLineBackgroundSeries.d.ts
│   │   │   │   │   │   ├── mapLineBackgroundSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── mapLineBackgroundSeriesProperties.d.ts
│   │   │   │   │   ├── map-marker
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── mapMarkerModule.d.ts
│   │   │   │   │   │   ├── mapMarkerSeries.d.ts
│   │   │   │   │   │   ├── mapMarkerSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── mapMarkerSeriesProperties.d.ts
│   │   │   │   │   ├── map-shape
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── mapShapeModule.d.ts
│   │   │   │   │   │   ├── mapShapeSeries.d.ts
│   │   │   │   │   │   ├── mapShapeSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── mapShapeSeriesProperties.d.ts
│   │   │   │   │   ├── map-shape-background
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── mapShapeBackgroundModule.d.ts
│   │   │   │   │   │   ├── mapShapeBackgroundSeries.d.ts
│   │   │   │   │   │   ├── mapShapeBackgroundSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── mapShapeBackgroundSeriesProperties.d.ts
│   │   │   │   │   ├── map-util
│   │   │   │   │   │   ├── bboxUtil.d.ts
│   │   │   │   │   │   ├── geoGeometry.d.ts
│   │   │   │   │   │   ├── geometryUtil.d.ts
│   │   │   │   │   │   ├── lineStringUtil.d.ts
│   │   │   │   │   │   ├── linkedList.d.ts
│   │   │   │   │   │   ├── mapThemeDefaults.d.ts
│   │   │   │   │   │   ├── mapUtil.d.ts
│   │   │   │   │   │   ├── mapZIndexMap.d.ts
│   │   │   │   │   │   ├── markerUtil.d.ts
│   │   │   │   │   │   ├── polygonLabelUtil.d.ts
│   │   │   │   │   │   ├── polygonPointSearch.d.ts
│   │   │   │   │   │   ├── polygonUtil.d.ts
│   │   │   │   │   │   ├── shapeFillBBox.d.ts
│   │   │   │   │   │   ├── topologySeries.d.ts
│   │   │   │   │   │   └── validation.d.ts
│   │   │   │   │   ├── nightingale
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── nightingaleModule.d.ts
│   │   │   │   │   │   ├── nightingaleSeries.d.ts
│   │   │   │   │   │   ├── nightingaleSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── nightingaleThemes.d.ts
│   │   │   │   │   │   └── nightingaleUtil.d.ts
│   │   │   │   │   ├── ohlc
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── ohlcAggregation.d.ts
│   │   │   │   │   │   ├── ohlcModule.d.ts
│   │   │   │   │   │   ├── ohlcNode.d.ts
│   │   │   │   │   │   ├── ohlcSeriesBase.d.ts
│   │   │   │   │   │   ├── ohlcSeries.d.ts
│   │   │   │   │   │   ├── ohlcSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── ohlcSeriesProperties.d.ts
│   │   │   │   │   ├── pyramid
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── pyramidModule.d.ts
│   │   │   │   │   │   ├── pyramidProperties.d.ts
│   │   │   │   │   │   ├── pyramidSeries.d.ts
│   │   │   │   │   │   ├── pyramidSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── pyramidThemes.d.ts
│   │   │   │   │   │   └── pyramidUtil.d.ts
│   │   │   │   │   ├── radar
│   │   │   │   │   │   ├── radarSeries.d.ts
│   │   │   │   │   │   ├── radarSeriesProperties.d.ts
│   │   │   │   │   │   └── radarThemes.d.ts
│   │   │   │   │   ├── radar-area
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radarAreaModule.d.ts
│   │   │   │   │   │   ├── radarAreaSeries.d.ts
│   │   │   │   │   │   ├── radarAreaSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── radarAreaSeriesProperties.d.ts
│   │   │   │   │   ├── radar-line
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radarLineModule.d.ts
│   │   │   │   │   │   ├── radarLineSeries.d.ts
│   │   │   │   │   │   └── radarLineSeriesOptionsDef.d.ts
│   │   │   │   │   ├── radial-bar
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radialBarModule.d.ts
│   │   │   │   │   │   ├── radialBarSeries.d.ts
│   │   │   │   │   │   ├── radialBarSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── radialBarSeriesProperties.d.ts
│   │   │   │   │   │   ├── radialBarThemes.d.ts
│   │   │   │   │   │   └── radialBarUtil.d.ts
│   │   │   │   │   ├── radial-column
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radialColumnModule.d.ts
│   │   │   │   │   │   ├── radialColumnSeriesBase.d.ts
│   │   │   │   │   │   ├── radialColumnSeriesBaseProperties.d.ts
│   │   │   │   │   │   ├── radialColumnSeries.d.ts
│   │   │   │   │   │   ├── radialColumnSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── radialColumnSeriesProperties.d.ts
│   │   │   │   │   │   ├── radialColumnThemes.d.ts
│   │   │   │   │   │   └── radialColumnUtil.d.ts
│   │   │   │   │   ├── radial-gauge
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── radialGaugeModule.d.ts
│   │   │   │   │   │   ├── radialGaugeNeedle.d.ts
│   │   │   │   │   │   ├── radialGaugeSeries.d.ts
│   │   │   │   │   │   ├── radialGaugeSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── radialGaugeSeriesProperties.d.ts
│   │   │   │   │   │   └── radialGaugeUtil.d.ts
│   │   │   │   │   ├── range-area
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── rangeAreaAggregation.d.ts
│   │   │   │   │   │   ├── rangeArea.d.ts
│   │   │   │   │   │   ├── rangeAreaModule.d.ts
│   │   │   │   │   │   ├── rangeAreaProperties.d.ts
│   │   │   │   │   │   ├── rangeAreaSeriesOptionsDef.d.ts
│   │   │   │   │   │   ├── rangeAreaThemes.d.ts
│   │   │   │   │   │   └── rangeAreaUtil.d.ts
│   │   │   │   │   ├── range-bar
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── rangeBarAggregation.d.ts
│   │   │   │   │   │   ├── rangeBarModule.d.ts
│   │   │   │   │   │   ├── rangeBarProperties.d.ts
│   │   │   │   │   │   ├── rangeBarSeries.d.ts
│   │   │   │   │   │   ├── rangeBarSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── rangeBarThemes.d.ts
│   │   │   │   │   ├── sankey
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── sankeyLayout.d.ts
│   │   │   │   │   │   ├── sankeyLink.d.ts
│   │   │   │   │   │   ├── sankeyModule.d.ts
│   │   │   │   │   │   ├── sankeySeries.d.ts
│   │   │   │   │   │   ├── sankeySeriesOptionsDef.d.ts
│   │   │   │   │   │   └── sankeySeriesProperties.d.ts
│   │   │   │   │   ├── sunburst
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── sunburstModule.d.ts
│   │   │   │   │   │   ├── sunburstSeries.d.ts
│   │   │   │   │   │   ├── sunburstSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── sunburstSeriesProperties.d.ts
│   │   │   │   │   ├── treemap
│   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   ├── main.d.ts
│   │   │   │   │   │   ├── treemapModule.d.ts
│   │   │   │   │   │   ├── treemapSeries.d.ts
│   │   │   │   │   │   ├── treemapSeriesOptionsDef.d.ts
│   │   │   │   │   │   └── treemapSeriesProperties.d.ts
│   │   │   │   │   ├── util
│   │   │   │   │   │   ├── autoSizedLabel.d.ts
│   │   │   │   │   │   └── labelFormatter.d.ts
│   │   │   │   │   └── waterfall
│   │   │   │   │   ├── index.d.ts
│   │   │   │   │   ├── main.d.ts
│   │   │   │   │   ├── waterfallModule.d.ts
│   │   │   │   │   ├── waterfallSeries.d.ts
│   │   │   │   │   ├── waterfallSeriesOptionsDef.d.ts
│   │   │   │   │   ├── waterfallSeriesProperties.d.ts
│   │   │   │   │   └── waterfallThemes.d.ts
│   │   │   │   ├── setup.d.ts
│   │   │   │   ├── typings.d.ts
│   │   │   │   └── utils
│   │   │   │   ├── aggregation.d.ts
│   │   │   │   └── polar.d.ts
│   │   │   └── umd
│   │   │   ├── ag-charts-enterprise.js
│   │   │   └── ag-charts-enterprise.min.js
│   │   ├── LICENSE.html
│   │   ├── package.json
│   │   └── README.md
│   └── ag-grid-enterprise
│   ├── CONTRIBUTING.md
│   ├── dist
│   │   ├── ag-grid-enterprise.js
│   │   ├── ag-grid-enterprise.min.js
│   │   ├── ag-grid-enterprise.min.noStyle.js
│   │   ├── ag-grid-enterprise.noStyle.js
│   │   ├── package
│   │   │   ├── main.cjs.js
│   │   │   ├── main.cjs.min.js
│   │   │   ├── main.esm.min.mjs
│   │   │   ├── main.esm.mjs
│   │   │   └── package.json
│   │   └── types
│   │   ├── package.json
│   │   └── src
│   │   ├── advancedFilter
│   │   │   ├── advancedFilterApi.d.ts
│   │   │   ├── advancedFilterComp.d.ts
│   │   │   ├── advanced-filter.css-GENERATED.d.ts
│   │   │   ├── advancedFilterCtrl.d.ts
│   │   │   ├── advancedFilterExpressionService.d.ts
│   │   │   ├── advancedFilterHeaderComp.d.ts
│   │   │   ├── advancedFilterLocaleText.d.ts
│   │   │   ├── advancedFilterModule.d.ts
│   │   │   ├── advancedFilterService.d.ts
│   │   │   ├── autocomplete
│   │   │   │   ├── agAutocomplete.css-GENERATED.d.ts
│   │   │   │   ├── agAutocomplete.d.ts
│   │   │   │   ├── agAutocompleteList.d.ts
│   │   │   │   ├── agAutocompleteRow.d.ts
│   │   │   │   └── autocompleteParams.d.ts
│   │   │   ├── builder
│   │   │   │   ├── addDropdownComp.d.ts
│   │   │   │   ├── advancedFilterBuilderComp.d.ts
│   │   │   │   ├── advancedFilterBuilderDragFeature.d.ts
│   │   │   │   ├── advancedFilterBuilderItemAddComp.d.ts
│   │   │   │   ├── advancedFilterBuilderItemComp.d.ts
│   │   │   │   ├── advancedFilterBuilderItemNavigationFeature.d.ts
│   │   │   │   ├── advancedFilterBuilderUtils.d.ts
│   │   │   │   ├── conditionPillWrapperComp.d.ts
│   │   │   │   ├── iAdvancedFilterBuilder.d.ts
│   │   │   │   ├── inputPillComp.d.ts
│   │   │   │   ├── joinPillWrapperComp.d.ts
│   │   │   │   └── selectPillComp.d.ts
│   │   │   ├── colFilterExpressionParser.d.ts
│   │   │   ├── filterExpressionOperators.d.ts
│   │   │   ├── filterExpressionParser.d.ts
│   │   │   ├── filterExpressionUtils.d.ts
│   │   │   └── joinFilterExpressionParser.d.ts
│   │   ├── aggregation
│   │   │   ├── aggColumnNameService.d.ts
│   │   │   ├── aggFuncService.d.ts
│   │   │   ├── aggregationApi.d.ts
│   │   │   ├── aggregationModule.d.ts
│   │   │   ├── aggregationStage.d.ts
│   │   │   ├── aggUtils.d.ts
│   │   │   ├── filterAggregatesStage.d.ts
│   │   │   ├── footerService.d.ts
│   │   │   ├── footerUtils.d.ts
│   │   │   └── valueColsSvc.d.ts
│   │   ├── agGridEnterpriseModule.d.ts
│   │   ├── allEnterpriseModule.d.ts
│   │   ├── cellRenderers
│   │   │   ├── enterpriseCellRendererModule.d.ts
│   │   │   ├── loadingCellRenderer.d.ts
│   │   │   └── skeletonCellRenderer.d.ts
│   │   ├── charts
│   │   │   ├── agChartsExports.d.ts
│   │   │   ├── chartComp
│   │   │   │   ├── chartController.d.ts
│   │   │   │   ├── chartProxies
│   │   │   │   │   ├── cartesian
│   │   │   │   │   │   ├── areaChartProxy.d.ts
│   │   │   │   │   │   ├── barChartProxy.d.ts
│   │   │   │   │   │   ├── cartesianChartProxy.d.ts
│   │   │   │   │   │   ├── histogramChartProxy.d.ts
│   │   │   │   │   │   ├── lineChartProxy.d.ts
│   │   │   │   │   │   ├── scatterChartProxy.d.ts
│   │   │   │   │   │   └── waterfallChartProxy.d.ts
│   │   │   │   │   ├── chartProxy.d.ts
│   │   │   │   │   ├── chartTheme.d.ts
│   │   │   │   │   ├── combo
│   │   │   │   │   │   └── comboChartProxy.d.ts
│   │   │   │   │   ├── enterpriseChartProxyFactory.d.ts
│   │   │   │   │   ├── funnel
│   │   │   │   │   │   └── funnelChartProxy.d.ts
│   │   │   │   │   ├── hierarchical
│   │   │   │   │   │   ├── hierarchicalChartProxy.d.ts
│   │   │   │   │   │   └── hierarchicalChartUtils.d.ts
│   │   │   │   │   ├── pie
│   │   │   │   │   │   └── pieChartProxy.d.ts
│   │   │   │   │   ├── polar
│   │   │   │   │   │   └── polarChartProxy.d.ts
│   │   │   │   │   ├── specialized
│   │   │   │   │   │   └── heatmapChartProxy.d.ts
│   │   │   │   │   └── statistical
│   │   │   │   │   ├── boxPlotChartProxy.d.ts
│   │   │   │   │   ├── rangeChartProxy.d.ts
│   │   │   │   │   └── statisticalChartProxy.d.ts
│   │   │   │   ├── datasource
│   │   │   │   │   └── chartDatasource.d.ts
│   │   │   │   ├── gridChartComp.d.ts
│   │   │   │   ├── menu
│   │   │   │   │   ├── advancedSettings
│   │   │   │   │   │   ├── advancedSettingsMenuFactory.d.ts
│   │   │   │   │   │   ├── advancedSettingsPanel.d.ts
│   │   │   │   │   │   └── interactivity
│   │   │   │   │   │   ├── animationPanel.d.ts
│   │   │   │   │   │   ├── crosshairPanel.d.ts
│   │   │   │   │   │   ├── navigatorPanel.d.ts
│   │   │   │   │   │   └── zoomPanel.d.ts
│   │   │   │   │   ├── chartMenuContext.d.ts
│   │   │   │   │   ├── chartMenu.d.ts
│   │   │   │   │   ├── chartMenuList.d.ts
│   │   │   │   │   ├── chartMenuParamsFactory.d.ts
│   │   │   │   │   ├── chartPanelFeature.d.ts
│   │   │   │   │   ├── chartToolbar.d.ts
│   │   │   │   │   ├── data
│   │   │   │   │   │   ├── categoriesDataPanel.d.ts
│   │   │   │   │   │   ├── chartDataPanel.d.ts
│   │   │   │   │   │   ├── chartSpecificDataPanel.d.ts
│   │   │   │   │   │   ├── dragDataPanel.d.ts
│   │   │   │   │   │   ├── seriesChartTypePanel.d.ts
│   │   │   │   │   │   └── seriesDataPanel.d.ts
│   │   │   │   │   ├── format
│   │   │   │   │   │   ├── axis
│   │   │   │   │   │   │   ├── axisTicksPanel.d.ts
│   │   │   │   │   │   │   ├── cartesianAxisPanel.d.ts
│   │   │   │   │   │   │   ├── gridLinePanel.d.ts
│   │   │   │   │   │   │   └── polarAxisPanel.d.ts
│   │   │   │   │   │   ├── chart
│   │   │   │   │   │   │   ├── backgroundPanel.d.ts
│   │   │   │   │   │   │   ├── chartPanel.d.ts
│   │   │   │   │   │   │   └── paddingPanel.d.ts
│   │   │   │   │   │   ├── fontPanel.d.ts
│   │   │   │   │   │   ├── formatPanel.d.ts
│   │   │   │   │   │   ├── groupExpansionFeature.d.ts
│   │   │   │   │   │   ├── legend
│   │   │   │   │   │   │   └── legendPanel.d.ts
│   │   │   │   │   │   ├── series
│   │   │   │   │   │   │   ├── calloutPanel.d.ts
│   │   │   │   │   │   │   ├── capsPanel.d.ts
│   │   │   │   │   │   │   ├── connectorLinePanel.d.ts
│   │   │   │   │   │   │   ├── markersPanel.d.ts
│   │   │   │   │   │   │   ├── seriesItemsPanel.d.ts
│   │   │   │   │   │   │   ├── seriesPanel.d.ts
│   │   │   │   │   │   │   ├── seriesUtils.d.ts
│   │   │   │   │   │   │   ├── shadowPanel.d.ts
│   │   │   │   │   │   │   ├── tileSpacingPanel.d.ts
│   │   │   │   │   │   │   └── whiskersPanel.d.ts
│   │   │   │   │   │   ├── titles
│   │   │   │   │   │   │   ├── chartTitlePanel.d.ts
│   │   │   │   │   │   │   ├── titlePanel.d.ts
│   │   │   │   │   │   │   └── titlesPanel.d.ts
│   │   │   │   │   │   └── toggleablePanel.d.ts
│   │   │   │   │   ├── settings
│   │   │   │   │   │   ├── chartSettingsPanel.d.ts
│   │   │   │   │   │   ├── miniCharts
│   │   │   │   │   │   │   ├── area
│   │   │   │   │   │   │   │   ├── miniArea.d.ts
│   │   │   │   │   │   │   │   ├── miniNormalizedArea.d.ts
│   │   │   │   │   │   │   │   └── miniStackedArea.d.ts
│   │   │   │   │   │   │   ├── bar
│   │   │   │   │   │   │   │   ├── miniBar.d.ts
│   │   │   │   │   │   │   │   ├── miniNormalizedBar.d.ts
│   │   │   │   │   │   │   │   └── miniStackedBar.d.ts
│   │   │   │   │   │   │   ├── column
│   │   │   │   │   │   │   │   ├── miniColumn.d.ts
│   │   │   │   │   │   │   │   ├── miniNormalizedColumn.d.ts
│   │   │   │   │   │   │   │   └── miniStackedColumn.d.ts
│   │   │   │   │   │   │   ├── combo
│   │   │   │   │   │   │   │   ├── miniAreaColumnCombo.d.ts
│   │   │   │   │   │   │   │   ├── miniColumnLineCombo.d.ts
│   │   │   │   │   │   │   │   └── miniCustomCombo.d.ts
│   │   │   │   │   │   │   ├── funnel
│   │   │   │   │   │   │   │   ├── miniConeFunnel.d.ts
│   │   │   │   │   │   │   │   ├── miniFunnel.d.ts
│   │   │   │   │   │   │   │   └── miniPyramid.d.ts
│   │   │   │   │   │   │   ├── hierarchical
│   │   │   │   │   │   │   │   ├── miniSunburst.d.ts
│   │   │   │   │   │   │   │   └── miniTreemap.d.ts
│   │   │   │   │   │   │   ├── histogram
│   │   │   │   │   │   │   │   └── miniHistogram.d.ts
│   │   │   │   │   │   │   ├── index.d.ts
│   │   │   │   │   │   │   ├── line
│   │   │   │   │   │   │   │   ├── miniLine.d.ts
│   │   │   │   │   │   │   │   ├── miniNormalizedLine.d.ts
│   │   │   │   │   │   │   │   └── miniStackedLine.d.ts
│   │   │   │   │   │   │   ├── miniChartApi.d.ts
│   │   │   │   │   │   │   ├── miniChart.d.ts
│   │   │   │   │   │   │   ├── miniChartHelpers.d.ts
│   │   │   │   │   │   │   ├── miniChartWithAxes.d.ts
│   │   │   │   │   │   │   ├── miniChartWithPolarAxes.d.ts
│   │   │   │   │   │   │   ├── pie
│   │   │   │   │   │   │   │   ├── miniDonut.d.ts
│   │   │   │   │   │   │   │   └── miniPie.d.ts
│   │   │   │   │   │   │   ├── polar
│   │   │   │   │   │   │   │   ├── miniNightingale.d.ts
│   │   │   │   │   │   │   │   ├── miniRadarArea.d.ts
│   │   │   │   │   │   │   │   ├── miniRadarLine.d.ts
│   │   │   │   │   │   │   │   ├── miniRadialBar.d.ts
│   │   │   │   │   │   │   │   └── miniRadialColumn.d.ts
│   │   │   │   │   │   │   ├── scatter
│   │   │   │   │   │   │   │   ├── miniBubble.d.ts
│   │   │   │   │   │   │   │   └── miniScatter.d.ts
│   │   │   │   │   │   │   ├── specialized
│   │   │   │   │   │   │   │   ├── miniHeatmap.d.ts
│   │   │   │   │   │   │   │   └── miniWaterfall.d.ts
│   │   │   │   │   │   │   └── statistical
│   │   │   │   │   │   │   ├── miniBoxPlot.d.ts
│   │   │   │   │   │   │   ├── miniRangeArea.d.ts
│   │   │   │   │   │   │   └── miniRangeBar.d.ts
│   │   │   │   │   │   └── miniChartsContainer.d.ts
│   │   │   │   │   └── tabbedChartMenu.d.ts
│   │   │   │   ├── model
│   │   │   │   │   ├── chartDataModel.d.ts
│   │   │   │   │   └── comboChartModel.d.ts
│   │   │   │   ├── services
│   │   │   │   │   ├── chartColumnService.d.ts
│   │   │   │   │   ├── chartCrossFilterService.d.ts
│   │   │   │   │   ├── chartMenuService.d.ts
│   │   │   │   │   ├── chartOptionsService.d.ts
│   │   │   │   │   └── chartTranslationService.d.ts
│   │   │   │   └── utils
│   │   │   │   ├── array.d.ts
│   │   │   │   ├── axisTypeMapper.d.ts
│   │   │   │   ├── chartParamsValidator.d.ts
│   │   │   │   ├── integration.d.ts
│   │   │   │   ├── object.d.ts
│   │   │   │   └── seriesTypeMapper.d.ts
│   │   │   ├── chartModelMigration.d.ts
│   │   │   ├── chartsApi.d.ts
│   │   │   ├── chartService.d.ts
│   │   │   ├── integratedChartsModule.css-GENERATED.d.ts
│   │   │   ├── integratedChartsModule.d.ts
│   │   │   ├── utils
│   │   │   │   └── validGridChartsVersion.d.ts
│   │   │   └── widgets
│   │   │   ├── agAngleSelect.d.ts
│   │   │   ├── agColorInput.d.ts
│   │   │   ├── agColorPanel.d.ts
│   │   │   ├── agColorPicker.d.ts
│   │   │   ├── agInputRange.d.ts
│   │   │   ├── agPillSelect.css-GENERATED.d.ts
│   │   │   ├── agPillSelect.d.ts
│   │   │   └── agSlider.d.ts
│   │   ├── clipboard
│   │   │   ├── clipboardApi.d.ts
│   │   │   ├── clipboardModule.d.ts
│   │   │   └── clipboardService.d.ts
│   │   ├── columnToolPanel
│   │   │   ├── agPrimaryCols.css-GENERATED.d.ts
│   │   │   ├── agPrimaryCols.d.ts
│   │   │   ├── agPrimaryColsHeader.d.ts
│   │   │   ├── agPrimaryColsList.d.ts
│   │   │   ├── columnModelItem.d.ts
│   │   │   ├── columnMoveUtils.d.ts
│   │   │   ├── columnsToolPanelModule.d.ts
│   │   │   ├── columnToolPanel.css-GENERATED.d.ts
│   │   │   ├── columnToolPanel.d.ts
│   │   │   ├── columnToolPanelFactory.d.ts
│   │   │   ├── modelItemUtils.d.ts
│   │   │   ├── pivotModePanel.d.ts
│   │   │   ├── toolPanelColumnComp.d.ts
│   │   │   ├── toolPanelColumnGroupComp.d.ts
│   │   │   └── toolPanelContextMenu.d.ts
│   │   ├── excelExport
│   │   │   ├── assets
│   │   │   │   ├── excelConstants.d.ts
│   │   │   │   ├── excelInterfaces.d.ts
│   │   │   │   ├── excelLegacyConvert.d.ts
│   │   │   │   ├── excelUtils.d.ts
│   │   │   │   └── xmlFactory.d.ts
│   │   │   ├── excelCreator.d.ts
│   │   │   ├── excelExportApi.d.ts
│   │   │   ├── excelExportModule.d.ts
│   │   │   ├── excelSerializingSession.d.ts
│   │   │   ├── excelXlsxFactory.d.ts
│   │   │   ├── files
│   │   │   │   └── ooxml
│   │   │   │   ├── cell.d.ts
│   │   │   │   ├── column.d.ts
│   │   │   │   ├── contentType.d.ts
│   │   │   │   ├── contentTypes.d.ts
│   │   │   │   ├── core.d.ts
│   │   │   │   ├── drawing.d.ts
│   │   │   │   ├── mergeCell.d.ts
│   │   │   │   ├── relationship.d.ts
│   │   │   │   ├── relationships.d.ts
│   │   │   │   ├── row.d.ts
│   │   │   │   ├── sharedStrings.d.ts
│   │   │   │   ├── sheet.d.ts
│   │   │   │   ├── sheets.d.ts
│   │   │   │   ├── styles
│   │   │   │   │   ├── alignment.d.ts
│   │   │   │   │   ├── border.d.ts
│   │   │   │   │   ├── borders.d.ts
│   │   │   │   │   ├── cellStyle.d.ts
│   │   │   │   │   ├── cellStyles.d.ts
│   │   │   │   │   ├── cellStyleXfs.d.ts
│   │   │   │   │   ├── cellXfs.d.ts
│   │   │   │   │   ├── fill.d.ts
│   │   │   │   │   ├── fills.d.ts
│   │   │   │   │   ├── font.d.ts
│   │   │   │   │   ├── fonts.d.ts
│   │   │   │   │   ├── numberFormat.d.ts
│   │   │   │   │   ├── numberFormats.d.ts
│   │   │   │   │   ├── protection.d.ts
│   │   │   │   │   ├── stylesheet.d.ts
│   │   │   │   │   └── xf.d.ts
│   │   │   │   ├── table.d.ts
│   │   │   │   ├── themes
│   │   │   │   │   ├── office
│   │   │   │   │   │   ├── colorScheme.d.ts
│   │   │   │   │   │   ├── fontScheme.d.ts
│   │   │   │   │   │   ├── formatScheme.d.ts
│   │   │   │   │   │   └── themeElements.d.ts
│   │   │   │   │   └── office.d.ts
│   │   │   │   ├── vmlDrawing.d.ts
│   │   │   │   ├── workbook.d.ts
│   │   │   │   └── worksheet.d.ts
│   │   │   └── zipContainer
│   │   │   ├── compress.d.ts
│   │   │   ├── convert.d.ts
│   │   │   ├── crcTable.d.ts
│   │   │   ├── zipContainer.d.ts
│   │   │   └── zipContainerHelper.d.ts
│   │   ├── features
│   │   │   ├── iVirtualListDragFeature.d.ts
│   │   │   └── virtualListDragFeature.d.ts
│   │   ├── filterToolPanel
│   │   │   ├── agFiltersToolPanelHeader.d.ts
│   │   │   ├── agFiltersToolPanelList.d.ts
│   │   │   ├── filtersToolPanel.css-GENERATED.d.ts
│   │   │   ├── filtersToolPanel.d.ts
│   │   │   ├── filtersToolPanelModule.d.ts
│   │   │   ├── toolPanelFilterComp.d.ts
│   │   │   └── toolPanelFilterGroupComp.d.ts
│   │   ├── find
│   │   │   ├── findApi.d.ts
│   │   │   ├── findCellRenderer.d.ts
│   │   │   ├── find.css-GENERATED.d.ts
│   │   │   ├── findModule.d.ts
│   │   │   └── findService.d.ts
│   │   ├── license
│   │   │   ├── gridLicenseManager.d.ts
│   │   │   ├── shared
│   │   │   │   ├── licenseManager.d.ts
│   │   │   │   └── md5.d.ts
│   │   │   ├── watermark.css-GENERATED.d.ts
│   │   │   └── watermark.d.ts
│   │   ├── main.d.ts
│   │   ├── masterDetail
│   │   │   ├── detailCellRendererCtrl.d.ts
│   │   │   ├── detailCellRenderer.d.ts
│   │   │   ├── detailFrameworkComponentWrapper.d.ts
│   │   │   ├── masterDetailApi.d.ts
│   │   │   ├── masterDetailModule.css-GENERATED.d.ts
│   │   │   ├── masterDetailModule.d.ts
│   │   │   └── masterDetailService.d.ts
│   │   ├── menu
│   │   │   ├── chartMenuItemMapper.d.ts
│   │   │   ├── columnChooserFactory.d.ts
│   │   │   ├── columnMenuFactory.d.ts
│   │   │   ├── contextMenu.d.ts
│   │   │   ├── enterpriseMenu.d.ts
│   │   │   ├── menuApi.d.ts
│   │   │   ├── menuItemMapper.d.ts
│   │   │   ├── menuModule.d.ts
│   │   │   └── menuUtils.d.ts
│   │   ├── misc
│   │   │   └── enterpriseFocusUtils.d.ts
│   │   ├── multiFilter
│   │   │   ├── multiFilter.d.ts
│   │   │   ├── multiFilterModule.d.ts
│   │   │   └── multiFloatingFilter.d.ts
│   │   ├── pivot
│   │   │   ├── pivotApi.d.ts
│   │   │   ├── pivotColDefService.d.ts
│   │   │   ├── pivotColsSvc.d.ts
│   │   │   ├── pivotModule.d.ts
│   │   │   ├── pivotResultColsService.d.ts
│   │   │   └── pivotStage.d.ts
│   │   ├── rangeSelection
│   │   │   ├── abstractSelectionHandle.d.ts
│   │   │   ├── agFillHandle.d.ts
│   │   │   ├── agRangeHandle.d.ts
│   │   │   ├── cellRangeFeature.d.ts
│   │   │   ├── dragListenerFeature.d.ts
│   │   │   ├── rangeHeaderHighlightFeature.d.ts
│   │   │   ├── rangeSelectionApi.d.ts
│   │   │   ├── rangeSelection.css-GENERATED.d.ts
│   │   │   ├── rangeSelectionModule.d.ts
│   │   │   ├── rangeService.d.ts
│   │   │   └── utils.d.ts
│   │   ├── richSelect
│   │   │   ├── richSelectCellEditor.d.ts
│   │   │   └── richSelectModule.d.ts
│   │   ├── rowGrouping
│   │   │   ├── columnDropZones
│   │   │   │   ├── agGridHeaderDropZones.d.ts
│   │   │   │   ├── baseDropZonePanel.d.ts
│   │   │   │   ├── dropZoneColumnComp.d.ts
│   │   │   │   ├── pivotDropZonePanel.d.ts
│   │   │   │   ├── rowGroupDropZonePanel.d.ts
│   │   │   │   └── valueDropZonePanel.d.ts
│   │   │   ├── groupFilter
│   │   │   │   ├── groupFilter.d.ts
│   │   │   │   └── groupFloatingFilter.d.ts
│   │   │   ├── groupStrategy
│   │   │   │   ├── batchRemover.d.ts
│   │   │   │   ├── groupRow.d.ts
│   │   │   │   ├── groupStrategy.d.ts
│   │   │   │   └── sortGroupChildren.d.ts
│   │   │   ├── rowGroupColsSvc.d.ts
│   │   │   ├── rowGroupingApi.d.ts
│   │   │   ├── rowGroupingModule.d.ts
│   │   │   └── rowGroupingUtils.d.ts
│   │   ├── rowHierarchy
│   │   │   ├── autoColService.d.ts
│   │   │   ├── baseExpansionService.d.ts
│   │   │   ├── clientSideExpansionService.d.ts
│   │   │   ├── flattenStage.d.ts
│   │   │   ├── flattenUtils.d.ts
│   │   │   ├── groupStage.d.ts
│   │   │   ├── rendering
│   │   │   │   ├── groupCellRendererCtrl.d.ts
│   │   │   │   ├── groupCellRenderer.d.ts
│   │   │   │   └── groupCellStyles.css-GENERATED.d.ts
│   │   │   ├── rowHierarchyModule.d.ts
│   │   │   ├── rowHierarchyUtils.d.ts
│   │   │   ├── showRowGroupColsService.d.ts
│   │   │   ├── stickyRowFeature.d.ts
│   │   │   └── stickyRowService.d.ts
│   │   ├── rowNumbers
│   │   │   ├── rowNumbers.css-GENERATED.d.ts
│   │   │   ├── rowNumbersModule.d.ts
│   │   │   └── rowNumbersService.d.ts
│   │   ├── serverSideRowModel
│   │   │   ├── blocks
│   │   │   │   └── blockUtils.d.ts
│   │   │   ├── listeners
│   │   │   │   ├── expandListener.d.ts
│   │   │   │   ├── filterListener.d.ts
│   │   │   │   ├── listenerUtils.d.ts
│   │   │   │   └── sortListener.d.ts
│   │   │   ├── nodeManager.d.ts
│   │   │   ├── serverSideRowModelApi.d.ts
│   │   │   ├── serverSideRowModel.d.ts
│   │   │   ├── serverSideRowModelModule.d.ts
│   │   │   ├── services
│   │   │   │   ├── selection
│   │   │   │   │   └── strategies
│   │   │   │   │   ├── defaultStrategy.d.ts
│   │   │   │   │   ├── groupSelectsChildrenStrategy.d.ts
│   │   │   │   │   └── iSelectionStrategy.d.ts
│   │   │   │   ├── serverSideExpansionService.d.ts
│   │   │   │   ├── serverSideSelectionService.d.ts
│   │   │   │   └── ssrmRowChildrenService.d.ts
│   │   │   ├── stores
│   │   │   │   ├── lazy
│   │   │   │   │   ├── lazyBlockLoadingService.d.ts
│   │   │   │   │   ├── lazyCache.d.ts
│   │   │   │   │   ├── lazyStore.d.ts
│   │   │   │   │   └── multiIndexMap.d.ts
│   │   │   │   ├── storeFactory.d.ts
│   │   │   │   └── storeUtils.d.ts
│   │   │   └── transactionManager.d.ts
│   │   ├── setFilter
│   │   │   ├── clientSideValueExtractor.d.ts
│   │   │   ├── filteringKeys.d.ts
│   │   │   ├── flatSetDisplayValueModel.d.ts
│   │   │   ├── iSetDisplayValueModel.d.ts
│   │   │   ├── localeText.d.ts
│   │   │   ├── setFilter.d.ts
│   │   │   ├── setFilterListItem.d.ts
│   │   │   ├── setFilterModelFormatter.d.ts
│   │   │   ├── setFilterModule.d.ts
│   │   │   ├── setFilterUtils.d.ts
│   │   │   ├── setFloatingFilter.d.ts
│   │   │   ├── setValueModel.d.ts
│   │   │   └── treeSetDisplayValueModel.d.ts
│   │   ├── sideBar
│   │   │   ├── agHorizontalResize.d.ts
│   │   │   ├── agSideBarButtons.d.ts
│   │   │   ├── agSideBar.css-GENERATED.d.ts
│   │   │   ├── agSideBar.d.ts
│   │   │   ├── common
│   │   │   │   ├── sideBarUtils.d.ts
│   │   │   │   └── toolPanelColDefService.d.ts
│   │   │   ├── sideBarApi.d.ts
│   │   │   ├── sideBarButtonComp.d.ts
│   │   │   ├── sideBarDefParser.d.ts
│   │   │   ├── sideBarModule.d.ts
│   │   │   ├── sideBarService.d.ts
│   │   │   └── toolPanelWrapper.d.ts
│   │   ├── sparkline
│   │   │   ├── sparklineCellRenderer.d.ts
│   │   │   ├── sparkline.css-GENERATED.d.ts
│   │   │   ├── sparklinesModule.d.ts
│   │   │   └── sparklinesUtils.d.ts
│   │   ├── statusBar
│   │   │   ├── agStatusBar.css-GENERATED.d.ts
│   │   │   ├── agStatusBar.d.ts
│   │   │   ├── providedPanels
│   │   │   │   ├── aggregationComp.d.ts
│   │   │   │   ├── agNameValue.d.ts
│   │   │   │   ├── filteredRowsComp.d.ts
│   │   │   │   ├── selectedRowsComp.d.ts
│   │   │   │   ├── totalAndFilteredRowsComp.d.ts
│   │   │   │   ├── totalRowsComp.d.ts
│   │   │   │   └── utils.d.ts
│   │   │   ├── statusBarApi.d.ts
│   │   │   ├── statusBarModule.d.ts
│   │   │   └── statusBarService.d.ts
│   │   ├── treeData
│   │   │   ├── abstractClientSideTreeNodeManager.d.ts
│   │   │   ├── clientSideChildrenTreeNodeManager.d.ts
│   │   │   ├── clientSidePathTreeNodeManager.d.ts
│   │   │   ├── fieldAccess.d.ts
│   │   │   ├── treeDataModule.d.ts
│   │   │   ├── treeNode.d.ts
│   │   │   ├── treeParentIdStrategy.d.ts
│   │   │   └── treeRow.d.ts
│   │   ├── version.d.ts
│   │   ├── viewportRowModel
│   │   │   ├── viewportRowModel.d.ts
│   │   │   └── viewportRowModelModule.d.ts
│   │   └── widgets
│   │   ├── agDialog.d.ts
│   │   ├── agGroupComponent.d.ts
│   │   ├── agMenuItemComponent.d.ts
│   │   ├── agMenuItemRenderer.d.ts
│   │   ├── agMenuList.d.ts
│   │   ├── agMenuPanel.d.ts
│   │   ├── agPanel.css-GENERATED.d.ts
│   │   ├── agPanel.d.ts
│   │   ├── AgPillContainer.d.ts
│   │   ├── agPill.d.ts
│   │   ├── agRichSelect.css-GENERATED.d.ts
│   │   ├── agRichSelect.d.ts
│   │   ├── agRichSelectList.d.ts
│   │   ├── agRichSelectRow.d.ts
│   │   ├── iTabbedLayout.d.ts
│   │   ├── iVirtualList.d.ts
│   │   ├── menu.css-GENERATED.d.ts
│   │   ├── menuItemModule.d.ts
│   │   ├── pillDragComp.d.ts
│   │   ├── pillDropZonePanel.css-GENERATED.d.ts
│   │   ├── pillDropZonePanel.d.ts
│   │   ├── tabbedLayout.d.ts
│   │   └── virtualList.d.ts
│   ├── LICENSE.html
│   ├── package.json
│   ├── README.md
│   ├── styles
│   │   ├── agGridAlpineFont.css
│   │   ├── agGridAlpineFont.min.css
│   │   ├── agGridBalhamFont.css
│   │   ├── agGridBalhamFont.min.css
│   │   ├── agGridClassicFont.css
│   │   ├── agGridClassicFont.min.css
│   │   ├── ag-grid.css
│   │   ├── agGridMaterialFont.css
│   │   ├── agGridMaterialFont.min.css
│   │   ├── ag-grid.min.css
│   │   ├── ag-grid-no-native-widgets.css
│   │   ├── ag-grid-no-native-widgets.min.css
│   │   ├── agGridQuartzFont.css
│   │   ├── agGridQuartzFont.min.css
│   │   ├── ag-theme-alpine.css
│   │   ├── ag-theme-alpine.min.css
│   │   ├── ag-theme-alpine-no-font.css
│   │   ├── ag-theme-alpine-no-font.min.css
│   │   ├── ag-theme-balham.css
│   │   ├── ag-theme-balham.min.css
│   │   ├── ag-theme-balham-no-font.css
│   │   ├── ag-theme-balham-no-font.min.css
│   │   ├── ag-theme-material.css
│   │   ├── ag-theme-material.min.css
│   │   ├── ag-theme-material-no-font.css
│   │   ├── ag-theme-material-no-font.min.css
│   │   ├── ag-theme-quartz.css
│   │   ├── ag-theme-quartz.min.css
│   │   ├── ag-theme-quartz-no-font.css
│   │   ├── ag-theme-quartz-no-font.min.css
│   │   ├── \_css-content.scss
│   │   ├── \_icon-font-codes.scss
│   │   ├── \_index.scss
│   │   └── \_shared.scss
│   └── SUPPORT_AND_MAINTENANCE.md
├── package.json
├── package-lock.json
├── pm2.json
├── postcss.config.mjs
├── prisma
│   ├── client
│   │   ├── default.d.ts
│   │   ├── default.js
│   │   ├── edge.d.ts
│   │   ├── edge.js
│   │   ├── index-browser.js
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   ├── libquery_engine-debian-openssl-3.0.x.so.node
│   │   ├── package.json
│   │   ├── query_engine-windows.dll.node
│   │   ├── runtime
│   │   │   ├── edge-esm.js
│   │   │   ├── edge.js
│   │   │   ├── index-browser.d.ts
│   │   │   ├── index-browser.js
│   │   │   ├── library.d.ts
│   │   │   ├── library.js
│   │   │   ├── react-native.js
│   │   │   └── wasm.js
│   │   ├── schema.prisma
│   │   ├── wasm.d.ts
│   │   └── wasm.js
│   ├── dev.db
│   ├── migrations
│   │   ├── 20250509075911_init
│   │   │   └── migration.sql
│   │   ├── 20250509082029_pagec
│   │   │   └── migration.sql
│   │   ├── 20250509083250_pagec2
│   │   │   └── migration.sql
│   │   ├── 20250509085549_make_page_nullable2
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── proxy.ts
├── public
│   ├── css
│   │   ├── fontiran.css
│   │   └── style.css
│   ├── file.svg
│   ├── fonts
│   │   ├── eot
│   │   │   ├── IRANYekanWebBlack.eot
│   │   │   ├── IRANYekanWebBold.eot
│   │   │   ├── IRANYekanWebExtraBlack.eot
│   │   │   ├── IRANYekanWebExtraBold.eot
│   │   │   ├── IRANYekanWebLight.eot
│   │   │   ├── IRANYekanWebMedium.eot
│   │   │   ├── IRANYekanWebRegular.eot
│   │   │   └── IRANYekanWebThin.eot
│   │   ├── svg
│   │   │   ├── iranyekanwebblack.svg
│   │   │   ├── iranyekanwebbold.svg
│   │   │   ├── iranyekanwebextrablack.svg
│   │   │   ├── iranyekanwebextrabold.svg
│   │   │   ├── iranyekanweblight.svg
│   │   │   ├── iranyekanwebmedium.svg
│   │   │   ├── IRANYekanWebRegular.svg
│   │   │   └── iranyekanwebthin.svg
│   │   ├── ttf
│   │   │   ├── IRANYekanWebBlack.ttf
│   │   │   ├── IRANYekanWebBold.ttf
│   │   │   ├── IRANYekanWebExtraBlack.ttf
│   │   │   ├── IRANYekanWebExtraBold.ttf
│   │   │   ├── IRANYekanWebLight.ttf
│   │   │   ├── IRANYekanWebMedium.ttf
│   │   │   ├── IRANYekanWebRegular.ttf
│   │   │   └── IRANYekanWebThin.ttf
│   │   ├── woff
│   │   │   ├── IRANYekanWebBlack.woff
│   │   │   ├── IRANYekanWebBold.woff
│   │   │   ├── IRANYekanWebExtraBlack.woff
│   │   │   ├── IRANYekanWebExtraBold.woff
│   │   │   ├── IRANYekanWebLight.woff
│   │   │   ├── IRANYekanWebMedium.woff
│   │   │   ├── IRANYekanWebRegular.woff
│   │   │   └── IRANYekanWebThin.woff
│   │   └── woff2
│   │   ├── IRANYekanWebBlack.woff2
│   │   ├── IRANYekanWebBold.woff2
│   │   ├── IRANYekanWebExtraBlack.woff2
│   │   ├── IRANYekanWebExtraBold.woff2
│   │   ├── IRANYekanWebLight.woff2
│   │   ├── IRANYekanWebMedium.woff2
│   │   ├── IRANYekanWebRegular.woff2
│   │   └── IRANYekanWebThin.woff2
│   ├── globe.svg
│   ├── images
│   │   └── 1.jpg
│   ├── IRANYekan.html
│   ├── logo.svg
│   ├── next.svg
│   ├── paper-dark.svg
│   ├── paper-nord.svg
│   ├── paper.svg
│   ├── vercel.svg
│   ├── WebFonts.png
│   └── window.svg
├── README.md
├── schemas
│   └── form.ts
├── tsconfig.json
└── types
├── calender-type.ts
├── element-type.tsx
├── persian-date.d.ts
└── tablae-type.ts

226 directories, 1139 files
'use client'
import \* as React from 'react'
import {
BoxIcon,
BrainIcon,
FormInputIcon,
ShieldCheckIcon,
CodeSquareIcon,
ChartBarBig,
FolderDot,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
Drawer,
DrawerClose,
DrawerContent,
DrawerDescription,
DrawerFooter,
DrawerHeader,
DrawerTitle,
} from '@/components/ui/drawer'

export function DrawerDemo({ children }: { children: React.ReactNode }) {
const router = useRouter()

const modules = [
{ icon: ShieldCheckIcon, label: 'کاربران و دسترسی', href: '/users' },
{ icon: FormInputIcon, label: 'فرمساز', href: '/form-builder' },
{ icon: BrainIcon, label: 'هوش مصنوعی', href: '/ai' },
{ icon: CodeSquareIcon, label: 'کد و فرایند', href: '/code' },
{ icon: ChartBarBig, label: 'گزارش', href: '/reports' },
{ icon: BoxIcon, label: 'لاگ', href: '/logs' },
{ icon: FolderDot, label: 'مدیریت فایل', href: '/files' },
]

return (
<Drawer direction="top">
{children}
<DrawerContent className="z-[9999] h-auto" dir="rtl">

<div className="mx-auto w-full">
<DrawerHeader>
<DrawerTitle>انتخابگر ماژول</DrawerTitle>
<DrawerDescription>ماژول مورد نظر را انتخاب کنید</DrawerDescription>
</DrawerHeader>
<div className="border-border flex flex-wrap justify-center gap-8 border p-4">
{modules.map((module) => (
<DrawerClose key={module.href} asChild>
<Link
                  href={module.href}
                  className="border-border hover:bg-accent hover:text-accent-foreground flex h-48 w-40 flex-col items-center justify-between rounded-2xl border p-4"
                >
<module.icon className="size-28" />
<span className="text-center">{module.label}</span>
</Link>
</DrawerClose>
))}
</div>
<DrawerFooter className="border-border my-2 flex items-center border">
<DrawerClose asChild>
<Button size="default" variant="ghost" className="h-full w-40">
بستن
</Button>
</DrawerClose>
</DrawerFooter>
</div>
</DrawerContent>
</Drawer>
)
}

and sidemenu
'use client'

import \* as React from 'react'
import {
BookOpen,
Bot,
LucideChartBarBig,
LucideTerminal,
LucideTextCursorInput,
LucideUserSearch,
Settings2,
User2,
UserRoundPenIcon,
UserSearchIcon,
} from 'lucide-react'

import { RiWaterFlashFill } from 'react-icons/ri'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
Sidebar,
SidebarContent,
SidebarFooter,
SidebarHeader,
} from '@/components/ui/sidebar'
import { Button } from './ui/button'
import { redirect } from 'next/navigation'

// This is sample data.
const data = {
user: {
name: 'shadcn',
email: 'm@example.com',
avatar: '/avatars/shadcn.jpg',
},
teams: [
{
name: 'کاربر سد',
logo: UserRoundPenIcon,
isDefault: true,
},
{
name: 'رئیس سد',
logo: UserSearchIcon,
isDefault: false,
},
{
name: 'راهبر آب منطقه ای',
logo: LucideUserSearch,
isDefault: false,
},
],
navMain: [
{
title: 'کاربران',
url: 'plauyground',
icon: User2,
isActive: true,
items: [
{
title: 'افراد',
url: '/dashboard/persons',
},
],
},
{
title: 'اطلاعات پایه',
url: '#',
icon: Bot,
items: [
{
title: 'Genesis',
url: '#',
},
{
title: 'Explorer',
url: '#',
},
{
title: 'Quantum',
url: '#',
},
],
},
{
title: 'ورود اطلاعات',
url: '#',
icon: BookOpen,
items: [
{
title: 'Introduction',
url: '#',
},
{
title: 'Get Started',
url: '#',
},
{
title: 'Tutorials',
url: '#',
},
{
title: 'Changelog',
url: '#',
},
],
},
{
title: 'گزارش',
url: '#',
icon: Settings2,
items: [
{
title: 'General',
icon: Settings2,
url: '#',
items: [
{
title: 'Profile',
url: '#',
},
{
title: 'Notifications',
url: '#',
},
{
title: 'Security',
url: '#',
},
],
},
{
title: 'Team',
url: '#',
},
{
title: 'Billing',
url: '#',
},
{
title: 'Limits',
url: '#',
},
],
},
],
projects: [
{
name: 'گزارش ساز',
url: '#',
icon: LucideChartBarBig,
},
{
name: 'فرم ساز',
url: '#',
icon: LucideTextCursorInput,
},
{
name: 'فرمول ‌ساز',
url: '#',
icon: LucideTerminal,
},
],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
return (
<Sidebar
variant="sidebar"
className="bg-background border-l"
collapsible="offcanvas"
{...props} >
<SidebarHeader className="bg-background border-border flex h-auto min-w-4 items-center justify-center gap-0">
<Button
variant={'ghost'}
onClick={() => {
redirect('/dashboard')
}}
className="gorup/site-name border-border flex h-16 w-full flex-row items-center justify-start gap-1 rounded-none border-b" >
<RiWaterFlashFill className="group-hover/site-name:text-primary mr-2 size-8" />
<span className="text-2xl">سد‌ایران</span>
</Button>
<TeamSwitcher teams={data.teams} />
</SidebarHeader>
<SidebarContent className="bg-background">
<NavMain items={data.navMain} />
<NavProjects projects={data.projects} />
</SidebarContent>
<SidebarFooter className="bg-background">
<NavUser user={data.user} />
</SidebarFooter>
</Sidebar>
)
}

## Module Routing Structure

The dashboard now groups every module inside the `(modules)` route group so the same
`DashboardShell` layout is shared across the hub, the studio, and all feature pages.
To add or evolve a module, drop its folder inside `app/(modules)` and provide a `page.tsx`
entry (and nested routes if needed). The group-level `layout.tsx` renders
`components/dashboard-shell.tsx`, which wires up the sidebar, headers, and persistent
filters for every module.

The key directories look like this:

```
app/
  (modules)/
    layout.tsx                 # wraps children in DashboardShell
    dashboard/
      page.tsx                 # module selector
      persons/
        data-table.tsx
        page.tsx               # /dashboard/persons
      resources/
        dashboard/
          loading.tsx
          page.tsx
        page.tsx               # /dashboard/resources
    form-builder/
      builder/
        [id]/loading.tsx
        [id]/page.tsx           # form builder studio
      page.tsx                 # /form-builder
    ai/
      page.tsx                 # /ai
    code/
      page.tsx                 # /code
    reports/
      page.tsx                 # /reports
    logs/
      page.tsx                 # /logs
    files/
      page.tsx                 # /files
```

Pages like `/dashboard/persons` and `/form-builder` inherit the dashboard chrome, while
the lightweight stubs under `/ai`, `/code`, `/reports`, `/logs`, and `/files`
act as placeholders until their business logic is ready.
codex resume 019e6de2-94e3-75d1-85ae-f3f95039560a
