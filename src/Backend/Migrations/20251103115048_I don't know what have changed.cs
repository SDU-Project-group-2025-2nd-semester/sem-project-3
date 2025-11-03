using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Idontknowwhathavechanged : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Desks_Rooms_RoomsId",
                table: "Desks");

            migrationBuilder.DropIndex(
                name: "IX_Desks_RoomsId",
                table: "Desks");

            migrationBuilder.DropColumn(
                name: "RoomsId",
                table: "Desks");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "Reservations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "Desks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<List<Guid>>(
                name: "ReservationIds",
                table: "Desks",
                type: "uuid[]",
                nullable: false);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "Desks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CompanyId",
                table: "Reservations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Desks_CompanyId",
                table: "Desks",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Desks_RoomId",
                table: "Desks",
                column: "RoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_Desks_Companies_CompanyId",
                table: "Desks",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Desks_Rooms_RoomId",
                table: "Desks",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Companies_CompanyId",
                table: "Reservations",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Desks_Companies_CompanyId",
                table: "Desks");

            migrationBuilder.DropForeignKey(
                name: "FK_Desks_Rooms_RoomId",
                table: "Desks");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Companies_CompanyId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CompanyId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Desks_CompanyId",
                table: "Desks");

            migrationBuilder.DropIndex(
                name: "IX_Desks_RoomId",
                table: "Desks");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Desks");

            migrationBuilder.DropColumn(
                name: "ReservationIds",
                table: "Desks");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "Desks");

            migrationBuilder.AddColumn<Guid>(
                name: "RoomsId",
                table: "Desks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Desks_RoomsId",
                table: "Desks",
                column: "RoomsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Desks_Rooms_RoomsId",
                table: "Desks",
                column: "RoomsId",
                principalTable: "Rooms",
                principalColumn: "Id");
        }
    }
}
