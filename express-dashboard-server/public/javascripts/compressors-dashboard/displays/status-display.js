export class StatusDisplay 
{
	constructor(container_id, status, title, statuses)
	{
		this.container_id = container_id;
		this.status = status;
		this.title = title;
		$(this.container_id).html("<span><h4 class=status-display><br>" + this.title + "</h4><h5 class=status-display>" + statuses[this.status] + "</h5></span>");
	}

	redraw(statuses)
	{
		$(this.container_id + " span h5.status-display").html(statuses[this.status]);
	}
}