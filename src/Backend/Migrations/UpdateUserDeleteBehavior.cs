using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

/// <inheritdoc />
public partial class UpdateUserDeleteBehavior : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_AspNetUsers_Companies_CompanyId",
            table: "AspNetUsers");

        migrationBuilder.DropForeignKey(
            name: "FK_AspNetUsers_Companies_CompanyId1",
            table: "AspNetUsers");

        migrationBuilder.DropForeignKey(
            name: "FK_DamageReports_AspNetUsers_ResolvedById",
            table: "DamageReports");

        migrationBuilder.DropForeignKey(
            name: "FK_DamageReports_AspNetUsers_SubmittedById",
            table: "DamageReports");

        migrationBuilder.DropIndex(
            name: "IX_AspNetUsers_CompanyId",
            table: "AspNetUsers");

        migrationBuilder.DropIndex(
            name: "IX_AspNetUsers_CompanyId1",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "CompanyId",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "CompanyId1",
            table: "AspNetUsers");

        migrationBuilder.AddColumn<string>(
            name: "ReadableId",
            table: "Room",
            type: "text",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "ReadableId",
            table: "Desks",
            type: "text",
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateTable(
            name: "UserCompanies",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                Role = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserCompanies", x => new { x.UserId, x.CompanyId });
                table.ForeignKey(
                    name: "FK_UserCompanies_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_UserCompanies_Companies_CompanyId",
                    column: x => x.CompanyId,
                    principalTable: "Companies",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_UserCompanies_CompanyId",
            table: "UserCompanies",
            column: "CompanyId");

        migrationBuilder.AddForeignKey(
            name: "FK_DamageReports_AspNetUsers_ResolvedById",
            table: "DamageReports",
            column: "ResolvedById",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "FK_DamageReports_AspNetUsers_SubmittedById",
            table: "DamageReports",
            column: "SubmittedById",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_DamageReports_AspNetUsers_ResolvedById",
            table: "DamageReports");

        migrationBuilder.DropForeignKey(
            name: "FK_DamageReports_AspNetUsers_SubmittedById",
            table: "DamageReports");

        migrationBuilder.DropTable(
            name: "UserCompanies");

        migrationBuilder.DropColumn(
            name: "ReadableId",
            table: "Room");

        migrationBuilder.DropColumn(
            name: "ReadableId",
            table: "Desks");

        migrationBuilder.AddColumn<Guid>(
            name: "CompanyId",
            table: "AspNetUsers",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "CompanyId1",
            table: "AspNetUsers",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_AspNetUsers_CompanyId",
            table: "AspNetUsers",
            column: "CompanyId");

        migrationBuilder.CreateIndex(
            name: "IX_AspNetUsers_CompanyId1",
            table: "AspNetUsers",
            column: "CompanyId1");

        migrationBuilder.AddForeignKey(
            name: "FK_AspNetUsers_Companies_CompanyId",
            table: "AspNetUsers",
            column: "CompanyId",
            principalTable: "Companies",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_AspNetUsers_Companies_CompanyId1",
            table: "AspNetUsers",
            column: "CompanyId1",
            principalTable: "Companies",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_DamageReports_AspNetUsers_ResolvedById",
            table: "DamageReports",
            column: "ResolvedById",
            principalTable: "AspNetUsers",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_DamageReports_AspNetUsers_SubmittedById",
            table: "DamageReports",
            column: "SubmittedById",
            principalTable: "AspNetUsers",
            principalColumn: "Id");
    }
}