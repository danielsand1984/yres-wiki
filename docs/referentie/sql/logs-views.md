---
sidebar_position: 3
title: Logs & views
description: Logtabellen en alle monitoring-/configuratie-views met hun output-kolommen.
---


> Beheer doe je bij voorkeur via de webapp; deze objecten zijn voor het SQL-endpoint (SSMS / Azure Data Studio).

## Logs

The database logs 4 main information flows: 1. The creation, altering and/or deletion of objects 2. Granting, Denying and Revoking user rights 3. Procedures and their results 4. Running and completed loads

These logs can be found in the following tables [Config].[EventLog] [Config].[ProcessLog] [Monitoring].[ls_trans] [Monitoriong].[ls_pipeline] Abstractions of these tables with more useful insights can be found in these views User and access management [Monitoring].[vwAccessManagement] [Monitoring].[vwUserManagement] Load monitoring [Monitoring].[vwUsedTables] [Monitoring].[vwLoadMonitor] [Monitoring].[vwLoads] [Monitoring].[vwMonitor] Object manipulation [Monitoring].[vwObjectAlterations]

## Views

### `[Monitoring].[vwLoadMonitor]`

**Purpose:**

To provide a comprehensive view of the load monitoring process, showing detailed load steps, runtime metrics, row counts, and statuses for each pipeline.

**Output Columns:**

[Workflow ID]  (WorkflowID)

[Pipeline ID]  (PipelineID)

[Pipeline name]  (PipelineName)

[Source system]  (Source_system)

[Target]  (Target)

[DateTime]  (DateTime)

[Started by]  (Started_by)

[LoadType]  (LoadType)

[LapageRecord]  (LapageRecord)

[ETL Date]  (ETLDate)

[Start load]  (Start load)

[Runtime sec: write loadstatus]  (Runtime in seconds for writing load status)

[Start truncate table]  (Start truncate table)

[Runtime sec: truncate table]  (Runtime in seconds for truncating table)

[Start load data]  (Start load data)

[Runtime sec: load data]  (Runtime in seconds for loading data)

[Start upsert HIS]  (Start upsert HIS)

[Runtime sec: upsert HIS]  (Runtime in seconds for upserting HIS)

[Start update ETL_EndDate]  (Start update ETL_EndDate)

[Runtime sec: update ETL_EndDate]  (Runtime in seconds for updating ETL_EndDate)

[Start count rows]  (Start count rows)

[Runtime sec: update count rows]  (Runtime in seconds for counting rows)

[End load]  (End load)

[Runtime sec: Pipeline]  (Total runtime in seconds for the pipeline)

[Copied rows]  (Number of copied rows)

[New rows]  (Number of new rows)

[Delta rows]  (Number of delta rows)

[Deleted rows]  (Number of deleted rows)

[Status]  (Status of the load)

[LapageLoad]  (Indicator if it is the lapage load)

### `[LoadManagement].[vwDictionary]`

**Purpose:**

To provide a detailed dictionary view for the load management process, including source and target data types, key columns, nullability, and other metadata for each column.

**Output Columns:**

RowId  (Generated row number for partition)

Source  (Source system name)

SourceSchema  (Source schema name)

SourceTable  (Source table name)

SourceColumn  (Source column name)

SourceDataType  (Source data type)

TargetDataType  (Mapped target data type)

NullAble  (Nullability of the column)

KeyColumn  (Indicator if the column is a key column)

RowHashColumn  (Indicator if the column is used in row hash)

FactColumn  (Indicator if the column is a fact column)

Position  (Position of the column)

LoadType  (Load type for the table)

deltaColumn  (Indicator if the column is a delta column)

TargetSource  (Target source system name)

TargetSchema  (Target schema name)

TargetTable  (Target table name)

ActualTableName  (Actual table name)

ActualStageSchema  (Actual staging schema name)

ActualHisSchema  (Actual historical schema name)

keepStage  (Indicator if the staging data should be kept)

### `[LoadManagement].[vwUsedTables]`

**Purpose:**

To provide a view of all used tables in the load management process, including metadata, row counts in DWH and staging, lapage load details, and change IDs.

**Output Columns:**

Source  (Source system name)

SourceSchema  (Source schema name)

SourceTable  (Source table name)

DataPlatForm  (Formatted data platform name)

LoadType  (Load type for the table)

DeltaColumn  (Delta column name)

CellRange  (Cell range in the source)

Sheet  (Sheet name in the source)

LapageRecord  (Indicator for the lapage record)

PackageSize  (Size of the package)

StageMemOptimized  (Indicator if staging is memory optimized)

ODSMemOptimized  (Indicator if ODS is memory optimized)

Surrogate  (Surrogate key indicator)

StoreType  (Storage type)

DeltaOverlap  (Delta overlap value)

DeltaOverlapUnit  (Unit for delta overlap)

LoadFilter  (Load filter criteria)

fileName  (File name in the source)

fileLocation  (File location in the source)

firstRowHeader  (Indicator if the first row is a header)

ColumnDelimiter  (Column delimiter in the source file)

RowDelimiter  (Row delimiter in the source file)

QuoteCharacter  (Quote character in the source file)

EscapeCharacter  (Escape character in the source file)

ChangeId  (Lapage open change ID)

[Rows in DWH]  (Row count in DWH)

[Rows in Staging]  (Row count in staging)

[Lapage Load]  (Date of the lapage load)

[Status of lapage load]  (Status of the lapage load)

Columns  (JSON formatted columns metadata)

Loads30Days  (JSON formatted loads in the last 30 days)

Details  (JSON formatted details of the table)

TargetTable  (Target table name)

MetadataComparison  (JSON formatted metadata comparison)

### `[Monitoring].[vwUsedTables]`

**Purpose:**

To provide a view of used tables in the monitoring process, showing the lapage load and status for each table.

**Output Columns:**

Source  (Source system name)

SourceSchema  (Source schema name)

SourceTable  (Source table name)

LoadType  (Load type for the table)

LapageLoad  (Date of the lapage load)

LapageStatus  (Status of the lapage load)

### `[Monitoring].[vwMonitor]`

**Purpose:**

To provide a comprehensive view of the monitoring process, showing detailed load steps, runtime metrics, row counts, statuses, and deletion details for each pipeline.

**Output Columns:**

[Workflow ID]  (WorkflowID)

[Pipeline ID]  (PipelineID)

[Pipeline name]  (PipelineName)

[Source system]  (Source_system)

[Target]  (Formatted target name)

[DateTime]  (DateTime)

[Started by]  (Started_by)

[LoadType]  (LoadType)

[ETL Date]  (ETLDate)

[Start load]  (Start load)

[Start load data]  (Start load data)

[Runtime sec: load data]  (Runtime in seconds for loading data)

[Start upsert HIS]  (Start upsert HIS)

[Runtime sec: upsert HIS]  (Runtime in seconds for upserting HIS)

[Start update ETL_EndDate]  (Start update ETL_EndDate)

[Runtime sec: update ETL_EndDate]  (Runtime in seconds for updating ETL_EndDate)

[End load]  (End load)

[Runtime sec: Pipeline]  (Total runtime in seconds for the pipeline)

[Copied rows]  (Number of copied rows)

[New rows]  (Number of new rows)

[Delta rows]  (Number of delta rows)

[Deleted rows]  (Number of deleted rows)

[Status]  (Status of the load)

[LapageLoad]  (Indicator if it is the lapage load)

[Deleted]  (Indicator if the pipeline was deleted)

[Deleted by]  (User who deleted the pipeline)

[Deleted on]  (Date when the pipeline was deleted)

### `[Config].[vwUserlog]`

**Purpose:**

This view is designed to provide a detailed log of user activities, including process steps, return codes, and messages. It is useful for auditing and tracking user actions within the system.

**Outputs:**

ProcessID : Unique identifier for the process.

Date : Date of the log entry.

Time : Time of the log entry.

timestamp : Timestamp of the log entry.

UserId : User identifier extracted from the appUser  field.

User : User name extracted from the appUser  field.

Process : Name of the process.

Process step : Specific step within the process.

returnCode : Return code of the process step.

MessageType : Type of message based on the return code.

Message : Concatenated message from multiple columns.

dbRequest : Database request associated with the log entry.

### `[Config].[vwUserLogJSON]`

**Purpose:**

This view provides a JSON representation of user logs, aggregating process steps and messages for each process. It is useful for integrating with applications that consume JSON data.

**Outputs:**

process : Name of the process.

returnCode : Highest return code for the process.

messageType : Type of message based on the highest return code.

timestamp : Timestamp of the log entry.

dbRequest : Database request associated with the log entry.

user : User name.

userId : User identifier.

processID : Unique identifier for the process (used in web applications).

Steps : JSON array of steps, messages, and timestamps for the process.

### `[Config].[vwDictionaryVsHis]`

**Purpose:**

This view compares the dictionary definitions of tables and their historical counterparts to identify discrepancies such as missing columns, type mismatches, and deleted columns. It is useful for maintaining consistency between current and historical table schemas.

**Outputs:**

Columns from the dictionary and used tables.

MissingColumns : Indicates if columns are missing.

TypeMismatch : Indicates if there is a data type mismatch.

DeletedColumns : Indicates if columns have been deleted.

### `[Config].[vwDictionaryVsStage]`

**Purpose:**

This view compares the dictionary definitions of tables and their staging counterparts to identify discrepancies such as missing columns, type mismatches, and deleted columns. It is useful for ensuring consistency between current and staging table schemas.

**Outputs:**

Columns from the dictionary and used tables.

MissingColumns : Indicates if columns are missing.

TypeMismatch : Indicates if there is a data type mismatch.

DeletedColumns : Indicates if columns have been deleted.

### `[LoadManagement].[vwExtractor]`

**Purpose:**

This view provides a dynamic dataset of tables and their metadata for extraction, utilizing the fxExtractor  function. It is useful for managing data extraction processes in a data warehouse environment.

**Outputs:**

All columns from the fxExtractor  function.

### `[LoadManagement].[vwArchivingExtractor]`

**Purpose:**

This view generates SQL scripts for archiving data based on the load type and delta columns. It is useful for automating the archiving process of historical data.

**Outputs:**

All columns from the archiving extractor function.

ArchivingDeltaScript : Generated SQL script for archiving delta changes.

### `[LoadManagement].[vwUnusedTables]`

**Purpose:**

This view identifies tables that are defined in the dictionary but not used in the active used tables. It is useful for cleaning up unused tables and maintaining a streamlined data warehouse.

**Outputs:**

Source : Source system name.

SourceSchema : Source schema name.

SourceTable : Source table name.

### `[LoadManagement].[vwUsedColumns]`

**Purpose:**

This view provides a list of columns that are actively used in the data warehouse. It is useful for managing and auditing the usage of table columns.

**Outputs:**

Source : Source system name.

SourceSchema : Source schema name.

SourceTable : Source table name.

SourceColumn : Source column name.

### `[LoadManagement].[vwUsedODSTablesAndColumns]`

**Purpose:**

This view provides a JSON representation of ODS (Operational Data Store) tables and their columns, including target data types. It is useful for integrating with applications that consume JSON data and for managing ODS tables and columns.

**Outputs:**

ODS_Schema : ODS schema name.

Source : Source system name.

SourceSchema : Source schema name.

SourceTable : Source table name.

Columns : JSON array of columns and their target data types.

### `[LoadManagement].[vwViewPersistence]`

**Purpose:**

This view provides information about the persistence of views, including source and destination details, delta columns, and last persist dates. It is useful for managing the persistence and updates of views in a data warehouse environment.

**Outputs:**

Various columns related to view persistence, including source and destination details, delta columns, and last persist dates.

### `[LoadManagement].[vwViewsAndColumns]`

**Purpose:**

This view provides a JSON representation of views and their columns, including data types. It is useful for integrating with applications that consume JSON data and for managing view columns in a data warehouse environment.

**Outputs:**

TABLE_SCHEMA : Schema name of the view.

TABLE_NAME : Name of the view.

Columns : JSON array of columns and their data types. 7.4.17 12. View: [Monitoring].[vwLoads]

**Purpose:**

This view provides detailed information about data loads, including timestamps, runtime metrics, row counts, and statuses. It is useful for monitoring and analyzing the performance of data loading processes.

**Outputs:**

Various columns related to load processes, including pipeline and workflow IDs, timestamps, runtime metrics, row counts, and statuses.

### `[Monitoring].[vwWorkflow]`

**Purpose:**

This view provides detailed information about workflows, including timestamps, runtime metrics, row counts, and statuses. It is useful for monitoring and analyzing the performance of workflows in a data warehouse environment.

**Outputs:**

Various columns related to workflow processes, including pipeline and workflow IDs, timestamps, runtime metrics, row counts, and statuses.
