---
sidebar_position: 1
title: Stored procedures
description: Volledige referentie van alle door Yres beheerde stored procedures (purpose, inputs, outputs).
---


> Beheer doe je bij voorkeur via de webapp; deze objecten zijn voor het SQL-endpoint (SSMS / Azure Data Studio).

## StoredProcedures

### `[Change].[spAddScriptedObject]`

**Purpose:**

This stored procedure is designed to add a scripted object (such as a stored procedure, function, trigger, view, or table) to a change within the change management system. It ensures that the object and its dependencies are properly tracked and managed within the specified change.

**Inputs:**

- `@ChangeID (INT)`: The ID of the change to which the object should be added.

- `@ObjectType (NVARCHAR(5))`: The type of the object (e.g., 'P' for stored procedure, 'FN' for scalar function).

- `@ObjectName (NVARCHAR(4000))`: The name of the object to be added.

- `@Delete (BIT, default 0)`: Indicates whether the object should be marked for deletion.

- `@AddDependencies (BIT, default 1)`: Indicates whether to automatically add dependencies of the object.

- `@IgnoreYresObjects (BIT, default 1)`: Indicates whether to ignore Yres-generated objects.

- `@appuser (NVARCHAR(512))`: The username of the person executing the procedure.

- `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`: Optional parameter to overwrite an existing process ID.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the addition of the scripted object and updates the change management tables accordingly.

### `[Change].[spAddTable]`

**Purpose:**

This stored procedure adds a table and its related metadata (such as columns, keys, and data types)

to an existing change within the change management system. It also manages dependencies and ensures that no active change conflicts exist.

**Inputs:**

- `@ChangeID (INT)`: The ID of the change to which the table should be added.

- `@Source (NVARCHAR(1024))`: The source system name.

- `@Schema (NVARCHAR(1024))`: The schema name of the table.

- `@Table (NVARCHAR(1024))`: The table name.

- `@appUser (NVARCHAR(MAX), default 'Unknown')`: The username of the person executing the procedure.

- `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`: Optional parameter to overwrite an existing process ID.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the addition of the table and updates the change management tables accordingly.

### `[Change].[spCopyTableContent]`

**Purpose:**

This stored procedure copies data from a source table to a target table, with the ability to map and cast columns as necessary. It is useful for transferring data between tables with similar but not identical structures.

**Inputs:**

- `@SourceTable (NVARCHAR(256))`: The name of the source table (including schema) from which data will be copied.

- `@TargetTable (NVARCHAR(256))`: The name of the target table (including schema) where data will be inserted.

- `@Execute (BIT, default 0)`: Indicates whether to execute the copy operation or just generate the SQL command.

**Outputs:**

This procedure does not return any direct outputs. It either executes the data transfer or logs the generated SQL command.

### `[Change].[spImport]`

**Purpose:**

This stored procedure imports changes described in a JSON format into the change management

system. It handles the addition or updating of changes, projects, content, and dependencies based on the provided JSON data.

**Inputs:**

- `@JSON (NVARCHAR(MAX))`: A JSON string containing the change details to be imported.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person performing the import.

**Outputs:**

This procedure logs the results of the import process and updates the change management tables with the imported data.

### `[Change].[spInstall]`

**Purpose:**

This stored procedure is designed to import a change into the target system, allowing for execution, printing of SQL, or impact analysis. It processes the changes specified by @ChangeID  and handles various object types within the change.

**Inputs:**

- `@ChangeID (NVARCHAR(1024))`: The ID of the change to be installed.

- `@Execute (INT, default 2)`: Execution mode—1 for execution, 0 for printing SQL, 2 for impact analysis.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

- `@CommitPartial (BIT, default 0)`: Indicates whether to commit partial results in case of failure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the installation process and updates the relevant change management tables.

### `[Change].[spMaintain]`

**Purpose:**

This stored procedure is designed to maintain a change by adding, updating, or deleting records in the change management system. It ensures that changes are properly recorded and managed.

**Inputs:**

- `@Action (NVARCHAR(256), default 'ADD')`: The action to perform (ADD, UPDATE, DELETE).

- `@Name (NVARCHAR(1024), default '')`: The name of the change.

- `@Description (NVARCHAR(MAX), default 'No description')`: A description of the change.

- `@Project (INT, default NULL)`: The project ID associated with the change.

- `@DueDate (DATE, default NULL)`: The due date for the change.

- `@Status (INT, default 1)`: The status of the change.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

- `@Id (INT, default -1)`: The ID of the change for update or delete actions.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the maintenance process and updates the relevant change management tables.

### `[Change].[spMaintainProject]`

**Purpose:**

This stored procedure is designed to maintain a project by adding, updating, or deleting records in the project management system. It ensures that projects are properly recorded and managed.

**Inputs:**

- `@Action (NVARCHAR(256), default 'ADD')`: The action to perform (ADD, UPDATE, DELETE).

- `@Name (NVARCHAR(1024), default '')`: The name of the project.

- `@Description (NVARCHAR(MAX), default 'No description')`: A description of the project.

- `@DueDate (DATE, default NULL)`: The due date for the project.

- `@Status (INT, default 1)`: The status of the project.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

- `@Id (INT, default -1)`: The ID of the project for update or delete actions.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the maintenance process and updates the relevant project management tables.

### `[Change].[spRelease]`

**Purpose:**

This stored procedure is designed to release a change in the change management system. It validates dependencies, updates the status of the change, and logs the release process.

**Inputs:**

- `@ChangeId (INT)`: The ID of the change to be released.

- `@UseLapageVersion (BIT, default 1)`: Indicates whether to use the lapage version of objects in the change.

- `@AppUser (NVARCHAR(1024))`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the release process and updates the relevant change management tables.

### `[Config].[spAddFrameWorkColumns]`

**Purpose:**

This stored procedure adds framework columns to a stage table in the data warehouse. It includes the addition of ETL metadata such as ETL date, key hash, and row hash columns.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the changes or just print the SQL script.

- `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`: The table to which the framework columns should be added.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the addition of framework columns and updates the relevant data warehouse tables.

### `[Config].[spCompareMetadata]`

**Purpose:**

This stored procedure refreshes the stored metadata comparison by comparing the current metadata with the stored metadata in the data warehouse. It identifies mismatches such as missing columns, deleted columns, or type mismatches.

**Inputs:**

This procedure does not require any inputs.

**Outputs:**

This procedure updates the Config.MetadataComparison  table with the results of the metadata comparison.

### `[Config].`

[spCreateExternalTablesFromDictionary]

**Purpose:**

This stored procedure creates external tables in the data warehouse based on the dictionary metadata. It is used for generating external table definitions for data integration purposes.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the changes or just print the SQL script.

- `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`: The table for which the external table should be created.

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the creation of external tables and updates the relevant metadata tables.

### `[Config].[spCreateTablesFromDictionary]`

**Purpose:**

This stored procedure creates tables in the database based on the metadata from a dictionary view. It is used to automate the creation of tables for data integration and management purposes.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the changes or just print the SQL script.

- `@SelectedSource (NVARCHAR(MAX), default 'NoneSelected')`: The source system for which tables should be created.

- `@SelectedSchema (NVARCHAR(MAX), default 'NoneSelected')`: The schema for which tables should be created.

- `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`: The specific table to be created.

- `@AppUser (NVARCHAR(MAX), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the creation of tables and updates the relevant metadata tables.

### `[Config].[spDeleteTablesFromDB]`

**Purpose:**

This stored procedure deletes tables from the database based on specified source, schema, and table names. It is used to remove tables that are no longer active or required.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the deletion or just print the SQL script.

- `@SelectedSource (NVARCHAR(MAX), default 'NoneSelected')`: The source system for which tables should be deleted.

- `@SelectedSchema (NVARCHAR(MAX), default 'NoneSelected')`: The schema for which tables should be deleted.

- `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`: The specific table to be deleted.

- `@AppUser (NVARCHAR(MAX), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the deletion of tables and updates the relevant metadata tables.

### `[Config].[spEnableColumnstore]`

**Purpose:**

This stored procedure enables a ColumnStore index on existing tables in the database. It is used to improve the performance of analytical queries by converting tables to ColumnStore indexes.

**Inputs:**

- `@Execute (BIT)`: Indicates whether to execute the changes or just print the SQL script.

- `@Schema (NVARCHAR(50), default 'BOTH')`: Specifies the schema (HIS or STAGE) where the ColumnStore index should be enabled.

- `@Table (NVARCHAR(1024))`: The name of the table for which the ColumnStore index should be enabled.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the enabling of ColumnStore indexes and updates the relevant metadata tables.

### `[Config].[spEnableMemoryOptimization]`

**Purpose:**

This stored procedure enables memory optimization in the current database by adding a MEMORY_OPTIMIZED_DATA filegroup and configuring necessary database settings. It is used to improve transaction performance by using in-memory OLTP features.

**Inputs:**

- `@Execute (BIT, default 1)`: Indicates whether to execute the changes or just print the SQL script.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to enabling memory optimization and updates the relevant metadata tables.

### `[Config].[spFillServices_SAC]`

**Purpose:**

This stored procedure imports SAC (SAP Analytics Cloud) providers into the configuration services table. It is used to populate the services table with SAC providers' metadata.

**Inputs:**

- `@input (ttServices_SAC READONLY)`: A table type containing SAC providers' metadata.

- `@source (NVARCHAR(1024))`: The source system from which the providers are imported.

- `@Execute (BIT, default 1)`: Indicates whether to execute the insertion or just print the SQL script.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to the insertion of SAC providers and updates the relevant metadata tables.

### `[Config].[spGetDependenciesSQL]`

**Purpose:**

This stored procedure analyzes a SQL SELECT statement to determine its dependencies within the database. It is used to identify the tables, views, and other objects that a SQL query depends on.

**Inputs:**

- `@SQL (NVARCHAR(MAX))`: The SQL SELECT statement to be analyzed.

**Outputs:**

This procedure returns the dependencies found within the provided SQL statement. It also logs messages and errors related to the dependency analysis.

### `[Config].[spSetDatabaseParameter]`

**Purpose:**

This stored procedure sets a specified database parameter to a given value. It is used to modify database settings dynamically.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the change or just print the SQL script.

- `@Parameter (NVARCHAR(256))`: The database parameter to be set.

- `@Setting (NVARCHAR(256))`: The value to which the database parameter should be set.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to setting the database parameter.

### `[Config].[spSetDatabaseServiceTier]`

**Purpose:**

This stored procedure changes the service tier of the database to a specified tier. It is used to scale the database's performance and resources by altering its service tier.

**Inputs:**

- `@toTier (NVARCHAR(250), default 'Default')`: The target service tier to which the database should be set.

- `@Execute (BIT, default 1)`: Indicates whether to execute the change or just print the SQL script.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to changing the service tier and updates the relevant metadata tables.

### `[Config].[spUpdateRefreshToken]`

**Purpose:**

This stored procedure updates the refresh and access tokens in the configuration tokens table. It is used to maintain the validity of tokens used for API authentication.

**Inputs:**

- `@Source (NVARCHAR(4000))`: The source system for which the tokens are being updated.

- `@RefreshToken (NVARCHAR(4000))`: The new refresh token.

- `@AccessToken (NVARCHAR(4000))`: The new access token.

- `@ExpirationTime (INT, default 10)`: The expiration time in minutes for the access token.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to updating the tokens and updates the relevant metadata tables.

### `[Config].[spUpdateTablesFromDictionary]`

**Purpose:**

This stored procedure updates existing tables in the database based on metadata from a dictionary view. It is used to modify table structures (add, remove, update columns) for data management purposes.

**Inputs:**

- `@Execute (BIT, default 0)`: Indicates whether to execute the changes or just print the SQL script.

- `@SelectedSource (NVARCHAR(MAX), default 'NoneSelected')`: The source system for which tables should be updated.

- `@SelectedSchema (NVARCHAR(MAX), default 'NoneSelected')`: The schema for which tables should be updated.

- `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`: The specific table to be updated.

- `@Methods (NVARCHAR(MAX))`: Specifies the actions to be taken (ADD, REMOVE, UPDATE).

- `@Stage (BIT, default 0)`: Indicates whether to apply changes to the staging tables.

- `@HIS (BIT, default 0)`: Indicates whether to apply changes to the history tables.

- `@AppUser (NVARCHAR(MAX), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It logs messages and errors related to updating tables and updates the relevant metadata tables.

### `[Config].[spWriteCrash]`

**Purpose:**

This stored procedure logs crash information to the Config.ProcessLog  table. It is used to capture detailed error information when a procedure fails.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process that encountered an error.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure that encountered the error.

- `@SpStep (NVARCHAR(4000))`: The step in the stored procedure where the error occurred.

- `@SpCall (NVARCHAR(MAX))`: The SQL call that was being executed when the error occurred.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@DbRequest (NVARCHAR(MAX), optional)`: The database request that led to the error.

- `@ErrorLine (INT)`: The line number in the SQL script where the error occurred.

- `@ErrorMessage (NVARCHAR(4000))`: The error message generated by SQL Server.

- `@ErrorNumber (INT)`: The error number generated by SQL Server.

- `@ErrorProcedure (NVARCHAR(4000))`: The name of the stored procedure where the error occurred.

- `@ErrorSeverity (INT)`: The severity of the error.

- `@ErrorState (INT)`: The state of the error.

**Outputs:**

This procedure does not return any direct outputs. It logs detailed error information to the Config.ProcessLog  table.

### `[Config].[spWriteDump]`

**Purpose:**

This stored procedure logs detailed dump information to the Config.ProcessLog  table. It is used for logging system errors that require more detailed analysis.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process that encountered an error.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure that encountered the error.

- `@SpStep (NVARCHAR(4000))`: The step in the stored procedure where the error occurred.

- `@SpCall (NVARCHAR(MAX))`: The SQL call that was being executed when the error occurred.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@DbRequest (NVARCHAR(MAX), optional)`: The database request that led to the error.

- `@ErrorLine (INT)`: The line number in the SQL script where the error occurred.

- `@ErrorMessage (NVARCHAR(4000))`: The error message generated by SQL Server.

- `@ErrorNumber (INT)`: The error number generated by SQL Server.

- `@ErrorProcedure (NVARCHAR(4000))`: The name of the stored procedure where the error occurred.

- `@ErrorSeverity (INT)`: The severity of the error.

- `@ErrorState (INT)`: The state of the error.

**Outputs:**

This procedure does not return any direct outputs. It logs detailed dump information to the Config.ProcessLog  table.

### `[Config].[spWriteError]`

**Purpose:**

This stored procedure logs error information to the Config.ProcessLog  table. It is used to capture detailed error information when a procedure encounters a problem.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process that encountered an error.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure that encountered the error.

- `@SpStep (NVARCHAR(4000))`: The step in the stored procedure where the error occurred.

- `@SpCall (NVARCHAR(MAX))`: The SQL call that was being executed when the error occurred.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@Message1 (NVARCHAR(4000))`: The primary error message.

- `@Message2 (NVARCHAR(4000), optional)`: Additional error message information.

- `@Message3 (NVARCHAR(4000), optional)`: Additional error message information.

- `@Message4 (NVARCHAR(4000), optional)`: Additional error message information.

- `@DbRequest (NVARCHAR(MAX), optional)`: The database request that led to the error.

- `@ErrorLine (INT, optional)`: The line number in the SQL script where the error occurred.

- `@ErrorMessage (NVARCHAR(4000), optional)`: The error message generated by SQL Server.

- `@ErrorNumber (INT, optional)`: The error number generated by SQL Server.

- `@ErrorProcedure (NVARCHAR(4000), optional)`: The name of the stored procedure where the error occurred.

- `@ErrorSeverity (INT, optional)`: The severity of the error.

- `@ErrorState (INT, optional)`: The state of the error.

**Outputs:**

This procedure does not return any direct outputs. It logs error information to the Config.ProcessLog  table.

### `[Config].[spWriteFullLog]`

**Purpose:**

This stored procedure writes full log entries to the Config.ProcessLog  table. It is used for logging various levels of information, including process steps, messages, and errors.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process being logged.

- `@CallSource (NVARCHAR(4000))`: The source system or hostname making the call.

- `@CallSourceType (NVARCHAR(4000))`: The type of application making the call.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure being logged.

- `@SpCall (NVARCHAR(MAX))`: The SQL call being executed.

- `@SpStep (NVARCHAR(4000))`: The step in the process being logged.

- `@ReturnCode (INT)`: The return code of the stored procedure.

- `@Message1 (NVARCHAR(4000))`: The primary message to be logged.

- `@Message2 (NVARCHAR(4000))`: Additional message information.

- `@Message3 (NVARCHAR(4000))`: Additional message information.

- `@Message4 (NVARCHAR(4000))`: Additional message information.

- `@DbUser (NVARCHAR(4000))`: The database user executing the procedure.

- `@DbServer (NVARCHAR(4000))`: The database server name.

- `@DbName (NVARCHAR(4000))`: The database name.

- `@DbRequest (NVARCHAR(MAX))`: The database request or query being logged.

- `@ErrorLine (INT)`: The line number in the SQL script where the error occurred.

- `@ErrorMessage (NVARCHAR(4000))`: The error message generated by SQL Server.

- `@ErrorNumber (INT)`: The error number generated by SQL Server.

- `@ErrorProcedure (NVARCHAR(4000))`: The name of the stored procedure where the error occurred.

- `@ErrorSeverity (INT)`: The severity of the error.

- `@ErrorState (INT)`: The state of the error.

**Outputs:**

This procedure does not return any direct outputs. It logs detailed process information to the Config.ProcessLog  table.

### `[Config].[spWriteLog]`

**Purpose:**

This stored procedure writes log entries to the Config.ProcessLog  table. It is used for logging messages, warnings, and errors during the execution of other stored procedures.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process being logged.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure being logged.

- `@SpStep (NVARCHAR(4000))`: The step in the process being logged.

- `@SpCall (NVARCHAR(MAX))`: The SQL call being executed.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@ReturnCode (INT)`: The return code of the stored procedure.

- `@Message1 (NVARCHAR(4000))`: The primary message to be logged.

- `@Message2 (NVARCHAR(4000), optional)`: Additional message information.

- `@Message3 (NVARCHAR(4000), optional)`: Additional message information.

- `@Message4 (NVARCHAR(4000), optional)`: Additional message information.

- `@DbRequest (NVARCHAR(MAX), optional)`: The database request or query being logged.

- `@ErrorLine (INT, optional)`: The line number in the SQL script where the error occurred.

- `@ErrorMessage (NVARCHAR(4000), optional)`: The error message generated by SQL Server.

- `@ErrorNumber (INT, optional)`: The error number generated by SQL Server.

- `@ErrorProcedure (NVARCHAR(4000), optional)`: The name of the stored procedure where the error occurred.

- `@ErrorSeverity (INT, optional)`: The severity of the error.

- `@ErrorState (INT, optional)`: The state of the error.

**Outputs:**

This procedure does not return any direct outputs. It logs messages, warnings, and errors to the Config.ProcessLog  table.

### `[Config].[spWriteMessage]`

**Purpose:**

This stored procedure logs informational messages to the Config.ProcessLog  table. It is used to record process steps and actions without errors.

**Inputs:**

- `@ProcessID (UNIQUEIDENTIFIER)`: The unique identifier for the process being logged.

- `@SpName (NVARCHAR(4000))`: The name of the stored procedure being logged.

- `@SpStep (NVARCHAR(4000))`: The step in the process being logged.

- `@SpCall (NVARCHAR(MAX))`: The SQL call being executed.

- `@AppUser (NVARCHAR(4000))`: The username of the person executing the procedure.

- `@Message1 (NVARCHAR(4000))`: The primary message to be logged.

**Outputs:**

This procedure does not return any direct outputs. It logs informational messages to the Config.ProcessLog  table.

### `[Config].[spWriteMessage]`

**Purpose:**

This stored procedure writes a log message to the Config.ProcessLog  table, including all relevant fields for tracking and debugging purposes.

**Inputs:**

- `@processID (uniqueidentifier)`: The unique identifier for the process being logged.

- `@spName (nvarchar(4000))`: The name of the stored procedure generating the log.

- `@spStep (nvarchar(4000))`: The step within the stored procedure being executed.

- `@spCall (nvarchar(max))`: The SQL call being executed.

- `@appUser (nvarchar(4000))`: The username of the person executing the procedure.

- `@message1 (nvarchar(4000))`: The primary log message.

- `@message2 (nvarchar(4000), optional)`: Additional log message information.

- `@message3 (nvarchar(4000), optional)`: Additional log message information.

- `@message4 (nvarchar(4000), optional)`: Additional log message information.

- `@dbRequest (nvarchar(max), optional)`: The database request or query being logged.

**Outputs:**

This procedure does not return any direct outputs. It logs detailed information to the Config.ProcessLog  table.

### `[Config].[spWriteWarning]`

**Purpose:**

This stored procedure writes a warning log to the Config.ProcessLog  table, capturing all relevant fields for monitoring and debugging purposes.

**Inputs:**

- `@processID (uniqueidentifier)`: The unique identifier for the process being logged.

- `@spName (nvarchar(4000))`: The name of the stored procedure generating the log.

- `@spStep (nvarchar(4000))`: The step within the stored procedure where the warning occurred.

- `@spCall (nvarchar(max))`: The SQL call being executed.

- `@appUser (nvarchar(4000))`: The username of the person executing the procedure.

- `@message1 (nvarchar(4000))`: The primary warning message.

- `@message2 (nvarchar(4000), optional)`: Additional warning message information.

- `@message3 (nvarchar(4000), optional)`: Additional warning message information.

- `@message4 (nvarchar(4000), optional)`: Additional warning message information.

- `@dbRequest (nvarchar(max), optional)`: The database request or query being logged.

**Outputs:**

This procedure does not return any direct outputs. It logs detailed warning information to the Config.ProcessLog  table.

### `[dbo].`

[spAdaptiveIndexDefrag_CurrentExecStats]

**Purpose:**

This stored procedure provides a report on the current execution status of index defragmentation tasks. It monitors what has been completed and what is still pending.

**Inputs:**

- `@dbname (NVARCHAR(255), optional)`: Specifies the database to monitor. If not provided, all databases are monitored.

**Outputs:**

This procedure returns a set of results that detail the progress of index and statistics defragmentation, showing both completed and pending tasks.

### `[dbo].[spAdaptiveIndexDefrag_Exceptions]`

**Purpose:**

This stored procedure manages exceptions for index defragmentation, allowing the exclusion of specific databases, days, tables, or indexes from the defragmentation process.

**Inputs:**

- `@exceptionMask_DB (NVARCHAR(255), optional)`: The database to be excluded from defragmentation.

- `@exceptionMask_days (NVARCHAR(27), optional)`: Days of the week to exclude from defragmentation, provided in short form (e.g., 'Mon,Wed').

- `@exceptionMask_tables (NVARCHAR(500), optional)`: Tables to be excluded from defragmentation.

- `@exceptionMask_indexes (NVARCHAR(500), optional)`: Indexes to be excluded from defragmentation.

**Outputs:**

This procedure does not return any direct outputs. It logs actions and results related to the management of defragmentation exceptions.

### `[dbo].[spAdaptiveIndexDefrag_PurgeLogs]`

**Purpose:**

This stored procedure purges old logs related to index defragmentation to prevent indefinite growth of the log tables.

**Inputs:**

- `@daystokeep (smallint, default 90)`: The number of days of logs to retain. Logs older than this will be deleted.

**Outputs:**

This procedure does not return any direct outputs. It deletes old log entries from the maintenance tables.

### `[dbo].[spCopyDB]`

**Purpose:**

This stored procedure creates a copy of an existing database, with options to drop the target database if it exists and to specify the service tier of the new database.

**Inputs:**

- `@sourceDB (NVARCHAR(1024))`: The name of the source database to be copied.

- `@targetDB (NVARCHAR(1024))`: The name of the target database to be created.

- `@targetTier (NVARCHAR(256), default 'GP_Gen5_2')`: The service tier for the new database.

- `@dropIfExists (BIT, default 0)`: Indicates whether to drop the target database if it already exists.

**Outputs:**

This procedure does not return any direct outputs. It logs messages indicating success or failure in creating the database copy.

### `[dbo].[spJsonToTable]`

**Purpose:**

This stored procedure converts JSON data into a relational table structure in SQL Server, allowing for easier data manipulation and querying.

**Inputs:**

- `@Collection (NVARCHAR(1024), optional)`: Specifies the JSON collection to be processed.

- `@json (NVARCHAR(max), default '{}')`: The JSON data to be converted.

- `@targetSchema (NVARCHAR(1024), optional)`: The schema where the table will be created.

- `@targetTable (NVARCHAR(1024), optional)`: The name of the target table to be created.

**Outputs:**

This procedure dynamically generates and executes a SQL script to convert the provided JSON data into a table. The resulting table structure is based on the JSON keys and values.

### `[dbo].[spLongPrint]`

**Purpose:**

This stored procedure prints long strings of text in chunks, allowing for better handling of large messages that exceed the default length limits in SQL Server.

**Inputs:**

- `@String (NVARCHAR(MAX))`: The long string of text to be printed.

**Outputs:**

This procedure does not return any direct outputs. It prints the provided string in manageable chunks to the console or log.

### `[dbo].[spMSForEachTable]`

**Purpose:**

This stored procedure executes a specified command against each table in the database, allowing for batch operations across multiple tables.

**Inputs:**

- `@command1 (NVARCHAR(2000))`: The primary command to be executed against each table.

- `@replacechar (NCHAR(1), default '?')`: The character in @command1 that will be replaced with the table name.

- `@command2 (NVARCHAR(2000), optional)`: An additional command to be executed.

- `@command3 (NVARCHAR(2000), optional)`: Another additional command to be executed.

- `@whereand (NVARCHAR(2000), optional)`: Additional conditions to apply to the table selection.

- `@precommand (NVARCHAR(2000), optional)`: A command to be executed before the main commands.

- `@postcommand (NVARCHAR(2000), optional)`: A command to be executed after the main commands.

**Outputs:**

This procedure does not return any direct outputs. It executes the specified commands against all relevant tables in the database.

### `[dbo].[spMSForEachWorker]`

**Purpose:**

This stored procedure is a worker procedure that assists [dbo].[spMSForEachTable]  in executing commands against each table in the database.

**Inputs:**

- `@command1 (NVARCHAR(2000))`: The primary command to be executed.

- `@replacechar (NCHAR(1), default '?')`: The character in @command1 that will be replaced.

- `@command2 (NVARCHAR(2000), optional)`: An additional command to be executed.

- `@command3 (NVARCHAR(2000), optional)`: Another additional command to be executed.

- `@worker_type (INT, default 1)`: Indicates the type of worker process.

**Outputs:**

This procedure does not return any direct outputs. It assists in executing commands against tables as part of the batch process initiated by [dbo].[spMSForEachTable] .

### `[dbo].[spRunSQL]`

**Purpose:**

This stored procedure runs any SQL statement provided as input, allowing for dynamic execution of SQL commands.

**Inputs:**

- `@SQL (NVARCHAR(max))`: The SQL statement to be executed.

**Outputs:**

This procedure does not return any direct outputs. It executes the provided SQL statement.

### `[LoadManagement].[spCheckKeyAndRowHash]`

**Purpose:**

This stored procedure checks the integrity of key and row hashes for specified tables, verifying the consistency of data between staging and history tables.

**Inputs:**

- `@EXECUTE (BIT, default 0)`: Indicates whether to execute the checks or just generate the SQL script.

- `@Source (NVARCHAR(MAX))`: The source system of the tables to be checked.

- `@Schema (NVARCHAR(MAX))`: The schema of the tables to be checked.

- `@Table (NVARCHAR(MAX))`: The name of the table to be checked.

- `@sampleSize (NVARCHAR(MAX), default 10)`: The sample size of rows to check.

**Outputs:**

This procedure returns a report on the integrity of key and row hashes, indicating whether the data is consistent.

### `[LoadManagement].[spFillDictionary_AFAS]`

**Purpose:**

This stored procedure imports metadata from an AFAS data source into a SQL Server dictionary table, mapping columns and data types.

**Inputs:**

- `@input (ttDictionary_AFAS READONLY)`: The table type containing AFAS dictionary data.

- `@source (NVARCHAR(1024))`: The source name of the data.

- `@EXECUTE (BIT, default 1)`: Indicates whether to execute the import or just generate the SQL script.

**Outputs:**

This procedure imports metadata into the LoadManagement.Dictionary  table or generates an SQL script for review.

### `[LoadManagement].[spFillDictionary_oDATA]`

**Purpose:**

This stored procedure imports metadata from an oData data source into a SQL Server dictionary table, mapping columns and data types.

**Inputs:**

- `@input (ttDictionary_oDataADF READONLY)`: The table type containing oData dictionary data.

- `@source (NVARCHAR(1024))`: The source name of the data.

- `@schema (NVARCHAR(1024), default 'API')`: The schema for the data.

- `@EXECUTE (BIT, default 1)`: Indicates whether to execute the import or just generate the SQL script.

**Outputs:**

This procedure imports metadata into the LoadManagement.Dictionary  table or generates an SQL script for review.

### `[LoadManagement].[spFillTable_Json]`

**Purpose:**

This stored procedure populates a table with data from a JSON file, converting the JSON structure into a tabular format.

**Inputs:**

- `@Collection (NVARCHAR(1024), optional)`: Specifies the JSON collection to be processed.

- `@jsonTable (ttTable_JsonAdf READONLY)`: The table type containing JSON data.

- `@targetSchema (NVARCHAR(1024), optional)`: The schema where the target table will be created.

- `@targetTable (NVARCHAR(1024), optional)`: The name of the target table to be created.

**Outputs:**

This procedure dynamically creates a table based on the JSON structure and populates it with the data.

### `[LoadManagement].[spFillTable_Monday]`

**Purpose:**

This stored procedure processes and maps data from http://Monday.com , transposing columns as necessary and inserting the data into a specified target table.

**Inputs:**

- `@Table (ttTable_Monday READONLY)`: The table type containing http://Monday.com data.

**Outputs:**

This procedure transposes the http://Monday.com data and inserts it into the specified target table.

### `[LoadManagement].[spFindTablesBehindSQL]`

**Purpose:**

This stored procedure identifies all tables referenced by a given SQL query, useful for dependency analysis.

**Inputs:**

- `@SQL (NVARCHAR(MAX))`: The SQL query to analyze.

**Outputs:**

This procedure returns a list of tables that are referenced by the given SQL query.

### `[LoadManagement].[spGenerateTypeMapping]`

**Purpose:**

This stored procedure generates type mappings for source systems, adding them to the LoadManagement.TypeMapping  table if they do not already exist.

**Inputs:**

- `@AppUser (NVARCHAR(4000), default 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure does not return any direct outputs. It updates the LoadManagement.TypeMapping table with any new type mappings found.

### `[LoadManagement].[spGetColumnMapping]`

**Purpose:**

This stored procedure generates a JSON object representing the column mappings between a source and target system, useful for ETL processes.

**Inputs:**

- `@tablename (VARCHAR(256), optional)`: The name of the source table.

- `@schemaname (VARCHAR(256), optional)`: The schema name of the source table.

- `@source (VARCHAR(256), optional)`: The name of the source system.

- `@Target (NVARCHAR(MAX), optional)`: The target system for the mapping.

- `@Pipeline_ID (NVARCHAR(MAX), default 1)`: The ID of the ETL pipeline.

**Outputs:**

This procedure returns a JSON object representing the field mappings for the specified source and target systems.

### `[LoadManagement].[spGetRowCount]`

**Purpose:**

This stored procedure returns the row count of a specified table, with options to get an exact count or a simple check for non-empty status.

**Inputs:**

- `@table (NVARCHAR(1024))`: The name of the table to count rows in.

- `@Exact (BIT)`: Indicates whether to get an exact row count (1) or just check for non-empty status (0).

- `@Active (NCHAR(1), default 0)`: Indicates whether to count only records where isCurrent = 1 .

**Outputs:**

This procedure returns the row count of the specified table.

### `[LoadManagement].[spHIS_InsertAndUpdate]`

**Purpose:**

This stored procedure inserts new records and updates existing records in a History (HIS) table, managing delta loads and maintaining data integrity.

**Inputs:**

- `@Target (NVARCHAR(MAX), optional)`: The target table for the operation.

- `@Pipeline_ID (NVARCHAR(MAX), default 1)`: The ID of the ETL pipeline.

- `@Execute (BIT, default 0)`: Indicates whether to execute the operation or just generate the SQL script.

- `@DeltaColumn (NVARCHAR(MAX), optional)`: The column used to identify delta changes.

- `@TableLoadType (NVARCHAR(MAX), optional)`: The type of table load operation (e.g., DELTA , OVERWRITE , RELOAD ).

**Outputs:**

This procedure updates the target HIS table with new or updated records and logs the operation's status.

### `[LoadManagement].[spHIS_TruncateTable]`

**Purpose:**

This stored procedure truncates or deletes all records from a history table ( HIS ) in a SQL Server database. The specific action depends on whether the table is memory optimized.

**Inputs:**

- `@Target (NVARCHAR(MAX))`: The name of the target table to truncate.

- `@EXECUTE (BIT, default = 1)`: Indicates whether to execute the truncation ( 1 ) or just print the SQL script ( 0 ).

**Outputs:**

This procedure either truncates or deletes records from the specified history table or prints the corresponding SQL script.

### `[LoadManagement].[spLoadDWH]`

**Purpose:**

This stored procedure triggers the data warehouse loading process by invoking specific procedures for inserting and updating data and updating the ETL end date.

**Inputs:**

- `@Target (NVARCHAR(MAX), optional)`: The target table for the data load.

- `@Pipeline_ID (NVARCHAR(MAX), default = '1')`: The ID of the ETL pipeline.

- `@Execute (BIT, default = 0)`: Indicates whether to execute the operations or just generate the SQL script.

- `@DeltaColumn (NVARCHAR(MAX), optional)`: The column used for delta changes.

- `@TableLoadType (NVARCHAR(MAX), optional)`: The type of table load operation (e.g., DELTA , FULL ).

**Outputs:**

This procedure calls the [LoadManagement].[spHIS_InsertAndUpdate]  and [LoadManagement].[spUpdateETL_EndDate]  procedures, executing or printing their results based on the input parameters.

### `[LoadManagement].[spMaintainFiles]`

**Purpose:**

This stored procedure manages files for import into the data warehouse, supporting actions such as adding, updating, deleting, or deactivating file entries.

**Inputs:**

- `@action (NVARCHAR(256), default = 'ADD')`: The action to perform (ADD, UPDATE, DELETE, DEACTIVATE).

- `@source (NVARCHAR(256))`: The source of the file data.

- `@schema (NVARCHAR(256))`: The schema name of the file data.

- `@table (NVARCHAR(256))`: The table name associated with the file data. Additional parameters such as @DataPlatform , @loadType , @deltaColumn , etc., define the specific configuration of the file import process.

**Outputs:**

This procedure modifies entries in the LoadManagement.UsedTables  and LoadManagement.UsedColumns  tables based on the specified action.

### `[LoadManagement].`

[spMaintainFilesInDictionary]

**Purpose:**

This stored procedure manages metadata for files in the SQL Server dictionary, including actions to add, update, or delete entries.

**Inputs:**

- `@EXECUTE (BIT, default = 0)`: Indicates whether to execute the SQL script or just print it.

- `@action (NVARCHAR(256))`: The action to perform (ADD, UPDATE, DELETE).

- `@source (NVARCHAR(4000), default = 'FILE')`: The source of the data.

- `@category (NVARCHAR(4000))`: The category of the file data.

- `@table (NVARCHAR(4000))`: The table name associated with the file data.

**Outputs:**

This procedure adds, updates, or deletes entries in the LoadManagement.Dictionary  and LoadManagement.UsedColumns  tables based on the specified action.

### `[LoadManagement].[spMaintainPersistView]`

**Purpose:**

This stored procedure manages the persistence of views in the data warehouse, including actions to add, update, or delete view persistence settings.

**Inputs:**

- `@action (NVARCHAR(256), default = 'ADD')`: The action to perform (ADD, UPDATE, DELETE).

- `@SourceDeltaObjectDB (NVARCHAR(128), optional)`: The database of the source delta object.

- `@SourceDeltaObjectSchemaName (NVARCHAR(128), optional)`: The schema name of the source delta object.

- `@SourceDeltaObjectName (NVARCHAR(128), optional)`: The name of the source delta object.

- `@SourceDeltaObjectType (NVARCHAR(1), optional)`: The type of the source delta object (V = View, T = Table). Additional parameters define the view and table configurations for persistence.

**Outputs:**

This procedure modifies entries in the LoadManagement.ViewPersistence  table based on the specified action.

### `[LoadManagement].[spMaintainRestService]`

**Purpose:**

This stored procedure manages REST services for import into the data warehouse, supporting actions such as adding, updating, deleting, or deactivating service entries.

**Inputs:**

- `@action (NVARCHAR(256), default = 'ADD')`: The action to perform (ADD, UPDATE, DELETE, DEACTIVATE).

- `@source (NVARCHAR(256))`: The source of the REST service.

- `@service (NVARCHAR(256))`: The name of the REST service.

- `@endpoint (NVARCHAR(256))`: The endpoint of the REST service. Additional parameters such as @DataPlatform , @loadType , @keepStage , etc., define the specific configuration of the REST service import process.

**Outputs:**

This procedure modifies entries in the LoadManagement.UsedTables  and LoadManagement.UsedColumns  tables based on the specified action.

### `[LoadManagement].[spMaintainSource]`

**Purpose:**

This stored procedure manages data sources in the data warehouse, supporting actions such as adding, updating, deleting, or deactivating source entries.

**Inputs:**

- `@action (NVARCHAR(256), default = 'ADD')`: The action to perform (ADD, UPDATE, DELETE, DEACTIVATE).

- `@source (NVARCHAR(256))`: The name of the data source.

- `@sourceType (NVARCHAR(256), optional)`: The type of the data source (e.g., database, API).

- `@AppUser (NVARCHAR(4000), default = 'Unknown')`: The username of the person executing the procedure.

**Outputs:**

This procedure modifies entries in the LoadManagement.SourceSystems  table based on the specified action.

### `[LoadManagement].[spMaintainTable]`

**Purpose:**

This stored procedure manages tables in the data warehouse, supporting actions such as adding, updating, or deleting table entries.

**Inputs:**

- `@action (NVARCHAR(256), default = 'ADD')`: The action to perform (ADD, UPDATE, DELETE).

- `@source (NVARCHAR(256))`: The source of the table data.

- `@schema (NVARCHAR(256))`: The schema name of the table data.

- `@table (NVARCHAR(256))`: The table name associated with the data. Additional parameters such as @DataPlatform , @fieldList , @loadType , etc., define the specific configuration of the table management process.

**Outputs:**

This procedure modifies entries in the LoadManagement.UsedTables , LoadManagement.UsedColumns , and other related tables based on the specified action.

### `[LoadManagement].[spMaintainTrigger]`

**Purpose:**

The specific purpose of this stored procedure is not provided, but typically a spMaintainTrigger procedure would be used to manage database triggers (adding, updating, or deleting them) based on specific requirements.

**Inputs:**

The inputs for this procedure are not provided in the script.

**Outputs:**

The outputs for this procedure are not provided in the script.

### `[LoadManagement].[spMaintainTrigger]`

**Purpose:**

To manage triggers for tables within the LoadManagement  schema. This includes adding new triggers or deleting existing ones based on the provided parameters.

**Inputs:**

- @action : The action to perform ( ADD or DELETE ).

- @source : The source name (can specify "all" for all sources).

- @schema : The schema name (can specify "all" for all schemas).

- @Table : The table name (can specify "all" for all tables).

- @Trigger : The trigger name (used with DELETE action; "ALL" can be used to delete all triggers for a specific table).

- @AppUser : The user performing the action.

**Outputs:**

No explicit outputs, but the procedure logs actions and errors using [Config]. [spWriteMessage] , [Config].[spWriteError] , and [Config]. [spWriteWarning] .

### `[LoadManagement].[spMaterializeViews]`

**Purpose:**

To load or materialize views into tables according to the trigger mapping defined in [LoadManagement].[TriggerMapping] . The procedure automates the data loading process based on the triggers defined.

**Inputs:**

- @WorkFlow : Identifier for the workflow.

- @PipelineName : Name of the pipeline.

- @Trigger : Name of the trigger that initiates the load.

- @ISource : Source name (can be 'AUTO' to auto-detect or 'ALL').

- @ISchema : Schema name (can be 'ALL').

- @IView : View name (can be 'ALL').

- @EXECUTE : Flag (1 or 0) indicating whether to execute the load or just print the SQL commands.

**Outputs:**

No direct outputs. The procedure logs the status and progress of the load using [Monitoring].[spWriteLoadStatus] .

### `[LoadManagement].`

[spMaterializeViewToTable]

**Purpose:**

To materialize a specific view into a corresponding table. It handles the transfer of data from the view to the table and supports both full and delta loads.

**Inputs:**

- @SourceSchemaName : The schema of the source view.

- @SourceViewName : The name of the source view.

- @execute : Flag (1 or 0) indicating whether to execute the materialization.

- @rows : Output parameter to capture the number of rows affected.

**Outputs:**

Outputs the number of rows affected by the materialization process.

### `[LoadManagement].[spPrepareCopy]`

**Purpose:**

To prepare for the copying or loading of data by truncating staging tables, looking up mappings, and initiating the load process.

**Inputs:**

Various parameters for pipeline identification, process steps, and target tables such as
- @PipelineID , @Process , @Step , @Status , @Rows , @WorkflowID ,
- @PipelineName , @Started_by , @Target , @Source_system , @Table , @Schema ,
- @LoadType , @LapageRecord , and @ETL_Date .

**Outputs:**

No direct outputs. Logs load status and any errors encountered during the preparation process using [Monitoring].[spWriteLoadStatus] .

### `[LoadManagement].`

[spRegenerateSurrogateKeys]

**Purpose:**

To regenerate surrogate keys for a specified source table. This procedure is typically used when there

are changes in the source data that require re-generating the unique identifiers (surrogate keys) for historical tables.

**Inputs:**

- @Source : The name of the data source.

- @SourceSchema : The schema of the source table.

- @SourceTable : The name of the source table.

- @Execute : Flag (1 or 0) indicating whether to execute the regeneration.

- @AppUser : The user initiating the procedure.

**Outputs:**

No direct outputs. The procedure generates and logs messages related to the regeneration process.

### `[Monitoring].[spWriteLoadStatus]`

**Purpose:**

This stored procedure is designed to log the status and details of data load processes within the system. It helps in tracking the progress of ETL (Extract, Transform, Load) workflows by recording key steps, their status, and any relevant messages or errors.

**Inputs:**

- `@PipelineID (NVARCHAR(255))`: A unique identifier for the pipeline being executed.

- `@Process (NVARCHAR(255), default NULL)`: The name or description of the process within the pipeline.

- `@Step (NVARCHAR(255), default NULL)`: The specific step within the process being logged.

- `@Status (NVARCHAR(255), default NULL)`: The current status of the step (e.g., 'Running', 'Completed', 'Failed').

- `@Rows (BIGINT, default NULL)`: The number of rows affected or processed in this step.

- `@WorkflowID (NVARCHAR(255), default NULL)`: An identifier for the overall workflow being executed.

- `@PipelineName (NVARCHAR(255), default NULL)`: The name of the pipeline.

- `@Started_by (NVARCHAR(255), default NULL)`: The user or system that initiated the process.

- `@Target (NVARCHAR(255), default NULL)`: The target system or table being loaded.

- `@Source_system (NVARCHAR(255), default NULL)`: The source system from which data is being extracted.

- `@Table (NVARCHAR(255), default NULL)`: The specific table being loaded.

- `@Schema (NVARCHAR(255), default NULL)`: The schema of the table being loaded.

- `@LoadType (NVARCHAR(255), default NULL)`: The type of load being performed (e.g., 'Full', 'Delta').

- `@LapageRecord (NVARCHAR(255), default NULL)`: The identifier or timestamp of the lapage record processed.

- `@ETL_Date (DATETIME, default NULL)`: The date and time when the ETL process occurred.

- `@Log (NVARCHAR(max), default 'No details provided')`: A log message or additional details about the process or step.

**Outputs:**

No direct output. The procedure inserts logs into LS_Pipeline  and LS_Trans  tables to record the process details and status. Additional Logic: If the @Step  is 'Start workflow' or 'Start load', it inserts a record into the LS_Pipeline  table with basic details about the workflow or load. Every step is logged in the LS_Trans  table. If the status is 'Failed', 'Fail', or 'Error', it raises an error with the logged message.

### `config.spGenerateDbreader`

**Purpose:**

This stored procedure dynamically generates and configures the Yres_dbreader  database role in SQL Server. The role is designed to have specific read permissions while denying other actions on certain schemas and objects. Detailed Description: The procedure checks if the Yres_dbreader  role already exists in the database. If it does, the role is dropped and recreated. The procedure then assigns this role to the db_datareader  role, granting it select permissions on all objects by default. However, it explicitly denies select, insert, update, and delete permissions on various schemas and objects to ensure restricted access. Additionally, any members of existing roles are added to the Yres_dbreader  role to maintain role memberships.

**Inputs:**

There are no input parameters for this procedure.

**Outputs:**

The procedure dynamically generates and executes SQL commands that configure the Yres_dbreader  role with specific permissions and memberships. Procedure Logic:

1. Variable Declarations:

- `@SQL (NVARCHAR(MAX))`: Holds the dynamically generated SQL query.

- `@Schema (NVARCHAR(1024))`: Stores the schema name retrieved using the Config.fxGetSetting function with 'SchemaHIS' as the key. 2. Role Existence Check: The procedure checks if the Yres_dbreader role already exists using the DATABASE_PRINCIPAL_ID function. If the role exists, it appends a command to drop the existing role to the @SQL variable. 3. Role Creation and Configuration: The procedure appends commands to create the Yres_dbreader role and assigns it to the db_datareader role. The procedure then appends multiple DENY statements to restrict select permissions on specified schemas and objects. Additionally, DENY INSERT , UPDATE , and DELETE permissions are appended for the schema stored in @Schema . 4. Role Membership Configuration: The procedure dynamically adds existing role members to the Yres_dbreader role by querying sys.database_role_members and sys.database_principals to find relevant roles and members. 5. Execution of Dynamic SQL: The final SQL query stored in the @SQL variable is executed using the EXEC command.

**Permissions Granted:**

The procedure grants select permissions on the Loadmanagement.SurrogateKeys  object and denies select permissions on various other schemas and objects. It also denies execute permissions on specific stored procedures.

**Role Membership:**

Any existing members of roles with the name Yres_dbReader  are added to the newly created Yres_dbreader  role. This procedure ensures that the Yres_dbreader  role is appropriately configured with the necessary permissions and maintains role membership consistency across the database.
