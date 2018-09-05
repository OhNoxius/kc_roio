<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:param name="chooseParameter"/>
	
	<xsl:strip-space elements="country"/>

	<xsl:key name="country" match="country" use="string()"/>
	<!--	<xsl:strip-space elements="artist"/>-->

	<xsl:template match="/">
		<div id="resultsTable">
			<xsl:apply-templates select="//*[local-name()=$chooseParameter][generate-id() = generate-id(key($chooseParameter, string())[1])]">
				<xsl:sort select="." order="ascending"/>
			</xsl:apply-templates>
		</div>
	</xsl:template>

	<xsl:template match="//*">
		<table id="{generate-id(.)}" summary="{string(current())}" style="width: 100%" border="0" align="length" cellpadding="3" cellspacing="0">

			<!--//small grey line-->
			<tr>
				<td colspan="3" style="background-color:#727272;height:1%;"/>
			</tr>

			<!--//title row-->
			<tr style="background-color:#EEEEEE;height:10px;" class="artistClass">
				<td>
					<strong>
						<xsl:value-of select="."/>
					</strong>
				</td>
				<td/>
				<td bgcolor="#EEEEEE" align="right">
					<input id="lnk_{generate-id(.)}" type="button" value="[+] Expand" style="border:none;background:none;width:85px;"/>
					<!--onclick="toggle_visibility('tab_{generate-id(.)}','lnk_{generate-id(.)}');"-->
				</td>
			</tr>

			<!--//session table header (new table)-->
			<tr>
				<td colspan="3" id="tab_{generate-id(.)}" data-calc="false" style="display:none;FONT-SIZE:100%;"> </td>
			</tr>
			<tr>
				<td colspan="3"/>
			</tr>

		</table>
	</xsl:template>

</xsl:stylesheet>
