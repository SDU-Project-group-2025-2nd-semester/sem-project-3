using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

/// <inheritdoc />
public partial class AddedMacaddressforRpis : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "RpiMacAddress",
            table: "Desks",
            type: "character varying(17)",
            maxLength: 17,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateTable(
            name: "UserCompanies",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                CompanyId = table.Column<Guid>(type: "uuid", nullable: false)
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
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "UserCompanies");

        migrationBuilder.DropColumn(
            name: "RpiMacAddress",
            table: "Desks");
    }
}