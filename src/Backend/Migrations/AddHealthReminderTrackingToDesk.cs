using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

/// <inheritdoc />
public partial class AddHealthReminderTrackingToDesk : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "JobId",
            table: "Reservations",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "LastHeightChangeTime",
            table: "Desks",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "NeedsHealthReminder",
            table: "Desks",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "Issue",
            table: "DamageReports",
            type: "text",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "SimulatorApiKey",
            table: "Companies",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "SimulatorLink",
            table: "Companies",
            type: "text",
            nullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "StandingHeight",
            table: "AspNetUsers",
            type: "integer",
            nullable: false,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<int>(
            name: "SittingHeight",
            table: "AspNetUsers",
            type: "integer",
            nullable: false,
            oldClrType: typeof(double),
            oldType: "double precision");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "JobId",
            table: "Reservations");

        migrationBuilder.DropColumn(
            name: "LastHeightChangeTime",
            table: "Desks");

        migrationBuilder.DropColumn(
            name: "NeedsHealthReminder",
            table: "Desks");

        migrationBuilder.DropColumn(
            name: "Issue",
            table: "DamageReports");

        migrationBuilder.DropColumn(
            name: "SimulatorApiKey",
            table: "Companies");

        migrationBuilder.DropColumn(
            name: "SimulatorLink",
            table: "Companies");

        migrationBuilder.AlterColumn<double>(
            name: "StandingHeight",
            table: "AspNetUsers",
            type: "double precision",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<double>(
            name: "SittingHeight",
            table: "AspNetUsers",
            type: "double precision",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");
    }
}