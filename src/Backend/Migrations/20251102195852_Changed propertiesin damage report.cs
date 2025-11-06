using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Changedpropertiesindamagereport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DamageReports_AspNetUsers_SubmittedById1",
                table: "DamageReports");

            migrationBuilder.DropIndex(
                name: "IX_DamageReports_SubmittedById1",
                table: "DamageReports");

            migrationBuilder.DropColumn(
                name: "SubmittedById1",
                table: "DamageReports");

            migrationBuilder.AlterColumn<string>(
                name: "SubmittedById",
                table: "DamageReports",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_DamageReports_SubmittedById",
                table: "DamageReports",
                column: "SubmittedById");

            migrationBuilder.AddForeignKey(
                name: "FK_DamageReports_AspNetUsers_SubmittedById",
                table: "DamageReports",
                column: "SubmittedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DamageReports_AspNetUsers_SubmittedById",
                table: "DamageReports");

            migrationBuilder.DropIndex(
                name: "IX_DamageReports_SubmittedById",
                table: "DamageReports");

            migrationBuilder.AlterColumn<Guid>(
                name: "SubmittedById",
                table: "DamageReports",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmittedById1",
                table: "DamageReports",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DamageReports_SubmittedById1",
                table: "DamageReports",
                column: "SubmittedById1");

            migrationBuilder.AddForeignKey(
                name: "FK_DamageReports_AspNetUsers_SubmittedById1",
                table: "DamageReports",
                column: "SubmittedById1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
